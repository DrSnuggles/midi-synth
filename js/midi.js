import {djme2} from './djme2.js'

export const midi = {}

let clockCnt = 0,
midiAccess = null,
devices = {
	key: {
		in: null,
		out: null
	},
	dj: {
		in: null,
		out: null
	},
}

function midiMessageReceived( ev ) {
	var cmd = ev.data[0] >> 4;
	var channel = ev.data[0] & 0xf;
	var noteNumber = ev.data[1];
	var velocity = ev.data[2];

	//console.log(ev.srcElement.name, cmd, channel, noteNumber, velocity)
	//if (ev.srcElement.name == 'Digital Jockey 2 Master Edition') {
	if (ev.srcElement.name == devices.dj.in?.name) {
		const djEv = djme2.translateEvent(ev)
		const [key, val] = Object.entries(djEv)[0]
		midi.callback({dj: {key: key, val: val}})
		//controller(key, val) // in synth.js
	//} else if (ev.srcElement.name == 'Digital Keyboard') {
	} else if (ev.srcElement.name == devices.key.in?.name) {
		if (ev.data[0] == 248) {
			// Timing clock = 24 pulses per quarter note
			clockCnt++
			if (clockCnt % 24 === 0) {
				clockCnt = 0 // protect overflow
				djme2.LEDon('keylock1', devices.dj)
				setTimeout(()=>{
					djme2.LEDoff('keylock1', devices.dj)
				}, 100)
			}
			return
		}
		if (ev.data[0] == 254) {
			// Active Sensing
			// see: http://midi.teragonaudio.com/tech/midispec/sense.htm
			//djme2.LEDtoggle('sync1', devices.dj)
			return
		}
		if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
			// note off
			//noteOff( noteNumber );
			midi.callback({key: {noteOff: noteNumber}})
		} else if (cmd == 9) {
			// note on
			//noteOn( noteNumber, velocity/127.0);
			midi.callback({key: {noteOn: noteNumber, vel: velocity/127.0}})
		} else {
			console.log( "Unknown Digital Keyboard midi: " + ev.data[0] + " " + ev.data[1] + " " + ev.data[2])
		}
	} else {
		console.log('former')
		// the former default fall back
		if (channel == 9)
			return
		if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
			// note off
			noteOff( noteNumber );
		} else if (cmd == 9) {
			// note on
			noteOn( noteNumber, velocity/127.0);
		} else if (cmd == 11) {
			controller( noteNumber, velocity/127.0);
		} else if (cmd == 14) {
			// pitch wheel
			pitchWheel( ((velocity * 128.0 + noteNumber)-8192)/8192.0 );
		} else if ( cmd == 10 ) {  // poly aftertouch
			polyPressure(noteNumber,velocity/127)
		} else
		console.log( "" + ev.data[0] + " " + ev.data[1] + " " + ev.data[2])

	}
}

function populateMIDIInSelect() {

	midiAccess.inputs.forEach(mid => {
		addMIDI('in', mid)
	})
  	midiAccess.outputs.forEach(mid => {
		addMIDI('out', mid)
	})
	function addMIDI(typ, mid) {
		const name = mid.name.toUpperCase()
		if (name.indexOf('KEYBOARD') > 0 || name.indexOf('MPK') > 0) {
			if (devices.key[typ] == mid) return
			devices.key[typ] = mid
			if (typ == 'in')
				mid.onmidimessage = midiMessageReceived
			if (typ == 'out') PianoDemoLights()
		}
		if (name.indexOf('JOCKEY') > 0) {
			if (devices.dj[typ] == mid) return
			devices.dj[typ] = mid
			if (typ == 'in')
				mid.onmidimessage = midiMessageReceived
			if (typ == 'out') DJDemoLights()
		}
	}

	//console.log(devices)
}

function midiConnectionStateChange( e ) {
	//console.log("connection: " + e.port.name + " " + e.port.connection + " " + e.port.state )
	populateMIDIInSelect()
}

function onMIDIStarted( midiAcc ) {
	midiAccess = midiAcc
	midiAccess.onstatechange = midiConnectionStateChange
	populateMIDIInSelect()

	//document.getElementById("synthbox").className = "loaded"
	//selectMIDI = document.getElementById("midiIn")
	//selectMIDI.onchange = selectMIDIIn
}

function onMIDISystemError( err ) {
	//document.getElementById("synthbox").className = "error"
	console.log( "MIDI not initialized - error encountered:" + err.code )
}

// init: start up MIDI
(()=>{
	if (navigator.requestMIDIAccess)
		navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError )
})()

function DJDemoLights() {
	Object.keys(djme2.leds).forEach(led => { djme2.LEDon(led, devices.dj) })
	Object.keys(djme2.leds).forEach(led => { djme2.LEDoff(led, devices.dj) })
}

function PianoDemoLights() {
	// 12 keys max
	const keepOnFor = 3
	const keepOffFor = 1
	
	function turnOn(num) {
		devices.key.out.send([0x90, num, 0x3f]) // half velo
		setTimeout(()=>{
			turnOff(num)
		}, keepOnFor)
	}
	function turnOff(num) {
		devices.key.out.send([0x90, num, 0x00])
		if (num < 96) {
			setTimeout(()=>{
				turnOn(num+1)
			}, keepOffFor)
		}
	}
	turnOn(36)
}
