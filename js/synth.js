import {WaveShaper} from './waveshaper.js'
import {store} from './storage.js'

var voices = new Array();
var audioContext = null;
var isMobile = false;	// we have to disable the convolver on mobile for performance reasons.

// This is the "initial patch"
export let synth = {
	currentModWaveform: 0,	// SINE
	currentModFrequency: 2.1, // Hz * 10 = 2.1
	currentModOsc1: 15,
	currentModOsc2: 17,
	
	currentOsc1Waveform: 2, // SAW
	currentOsc1Octave: 0,  // 32'
	currentOsc1Detune: 0,	// 0
	currentOsc1Mix: 50.0,	// 50%
	
	currentOsc2Waveform: 2, // SAW
	currentOsc2Octave: 0,  // 16'
	currentOsc2Detune: -25,	// fat detune makes pretty analogue-y sound.  :)
	currentOsc2Mix: 50.0,	// 0%
	
	currentFilterCutoff: 8,
	currentFilterQ: 7.0,
	currentFilterMod: 21,
	currentFilterEnv: 56,
	
	currentEnvA: 2,
	currentEnvD: 15,
	currentEnvS: 68,
	currentEnvR: 5,
	
	currentFilterEnvA: 5,
	currentFilterEnvD: 6,
	currentFilterEnvS: 5,
	currentFilterEnvR: 7,
	
	currentDrive: 38,
	currentRev: 32,
	currentVol: 75,

	currentPitchWheel: 0.0,
}
// end initial patch
// overwrite with saved settings
synth = {...synth, ...store.store}

var keys = new Array( 256 );
/* old mapping
keys[65] = 60; // = C4 ("middle C")
keys[87] = 61;
keys[83] = 62;
keys[69] = 63;
keys[68] = 64;
keys[70] = 65; // = F4
keys[84] = 66;
keys[71] = 67;
keys[89] = 68;
keys[72] = 69;
keys[85] = 70;
keys[74] = 71;
keys[75] = 72; // = C5
keys[79] = 73;
keys[76] = 74;
keys[80] = 75;
keys[186] = 76;
keys[222] = 77; // = F5
keys[221] = 78;
keys[13] = 79;
keys[220] = 80;
*/

//Lower row: zsxdcvgbhnjm...
keys[16] = 41; // = F2
keys[65] = 42;
//keys[90] = 43;
keys[89] = 43; // german layout ;)
keys[83] = 44;
keys[88] = 45;
keys[68] = 46;
keys[67] = 47;
keys[86] = 48; // = C3
keys[71] = 49;
keys[66] = 50;
keys[72] = 51;
keys[78] = 52;
keys[77] = 53; // = F3
keys[75] = 54;
keys[188] = 55;
keys[76] = 56;
keys[190] = 57;
//keys[186] = 58;
keys[192] = 58;
//keys[191] = 59;
keys[189] = 59; // german layout ;)

// Upper row: q2w3er5t6y7u...
keys[81] = 60; // = C4 ("middle C")
keys[50] = 61;
keys[87] = 62;
keys[51] = 63;
keys[69] = 64;
keys[82] = 65; // = F4
keys[53] = 66;
keys[84] = 67;
keys[54] = 68;
//keys[89] = 69;
keys[90] = 69; // german layout ;)
keys[55] = 70;
keys[85] = 71;
keys[73] = 72; // = C5
keys[57] = 73;
keys[79] = 74;
keys[48] = 75;
keys[80] = 76;
//keys[219] = 77; // = F5
keys[186] = 77; // = F5
//keys[187] = 78;
//keys[221] = 79;
keys[221] = 78;
keys[187] = 79;
keys[220] = 80;

function setKnob(id, val) {
	const knob = knobs.find(o => o.id === id)
	knob.setValue(val)
}

var effectChain = null;
var waveshaper = null;
var volNode = null;
var revNode = null;
var revGain = null;
var revBypassGain = null;
var compressor = null;

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

synth.noteOn = (note, velocity ) => {
	//console.log("note on: " + note )
	if (voices[note] == null) {
		// Create a new synth node
		voices[note] = new Voice(note, velocity);
		//Ensure that the highlight on pressed key is added, regardless of selected octave
		//var e = document.getElementById( "k" + (note + 12*(currentOctave - 3)));
		const noteIndex = (note + 12*(currentOctave - 3))
		const e = document.querySelectorAll('#keybox > div')[noteIndex - 36]
		if (e) e.classList.add("pressed")
	}
}

synth.noteOff = (note) => {
	if (voices[note] != null) {
		// Shut off the note playing and clear it 
		voices[note].noteOff()
		voices[note] = null
			//Ensure that the highlight on pressed key is removed, regardless of selected octave
			//var e = document.getElementById( "k" + (note + 12*(currentOctave - 3)));
			const noteIndex = (note + 12*(currentOctave - 3))
			const e = document.querySelectorAll('#keybox > div')[noteIndex - 36]
			if (e) e.classList.remove("pressed")
	}
}

synth.controller = ( number, value, updKnob) => {
	// entrance to also save the settings afterwards
	synth.controller2(number, value, updKnob)
	store.set(synth)
}
synth.controller2 = ( number, value, updKnob) => {

	console.log('controller', number, value, updKnob)
	function $(id) {
		return document.getElementById(id)
	}
	
	switch(number) {
	// not visible
	case 'pitchFader1':
		pitchWheel( 2*value-1 ) // 0..1 --> -1 ... +1
		return

	// OSC1
	case 'preview1But':
		if (value) {
			let options = $('osc1wave').options
			let ind = options.selectedIndex
			ind++
			if (ind >= options.length) ind = 0
			$('osc1wave').selectedIndex = ind
			onUpdateOsc1Wave(ind)
		}
		return
	case 'shift1But':
		if (value) {
			let options = $('osc1int').options
			let ind = options.selectedIndex
			ind++
			if (ind >= options.length) ind = 0
			$('osc1int').selectedIndex = ind
			onUpdateOsc1Octave(ind)
		}
		return
	case 'fx11':		// dj deck knob name
		// -1|+1 --> 0..+1
		value = (synth.currentOsc1Detune+1200)/2400 + value/10
		// intended fall
	case 'osc1detune':	// knob name
		// 0..1 --> -1200..+1200
		value = value*2400 -1200
		if (value < -1200) value = -1200
		if (value > +1200) value = +1200
		if (updKnob) setKnob('osc1detune', value)
		onUpdateOsc1Detune(value)
		return
	case 'fx12':
		// -1 / +1 --> 0..1
		value = synth.currentOsc1Mix/100 + value/10
		// intended fall
	case 'osc1mix':
		// 0..1 --> 0..100
		value = value * 100
		if (value < 0) value = 0
		if (value > 100) value = 100
		if (updKnob) setKnob('osc1mix', value)
		onUpdateOsc1Mix(value)
		return

	// OSC2
	case 'active11But':
		if (value) {
			let options = $('osc2wave').options
			let ind = options.selectedIndex
			ind++
			if (ind >= options.length) ind = 0
			$('osc2wave').selectedIndex = ind
			onUpdateOsc2Wave(ind)
		}
		return
	case 'active12But':
		if (value) {
			let options = $('osc2int').options
			let ind = options.selectedIndex
			ind++
			if (ind >= options.length) ind = 0
			$('osc2int').selectedIndex = ind
			onUpdateOsc2Octave(ind)
		}
		return
	case 'fx13':
		// -1|+1 --> -1200..+1200
		value = (synth.currentOsc2Detune+1200)/2400 + value/10
		// intended fall
	case 'osc2detune':
		// 0..1 --> -1200..+1200
		value = value*2400 -1200
		if (value < -1200) value = -1200
		if (value > +1200) value = +1200
		if (updKnob) setKnob('osc2detune', value)
		onUpdateOsc2Detune(value)
		return
	case 'loop1':
		// -1 / +1 --> 0..1
		value = synth.currentOsc2Mix/100 + value/10
		// intended fall
	case 'osc2mix':
		// 0..1 --> 0..100
		value = value * 100
		if (value < 0) value = 0
		if (value > 100) value = 100
		if (updKnob) setKnob('osc2mix', value)
		onUpdateOsc2Mix(value)
		return

	// MOD
	case 'load1But':
		if (value) {
			let options = $('modwave').options
			let ind = options.selectedIndex
			ind++
			if (ind >= options.length) ind = 0
			$('modwave').selectedIndex = ind
			synth.onUpdateModWaveform(ind)
		}
		return
	case 4:
	case 17:
	case 'hi1':
	case 'mFreq':
	    //$("mFreq").setValue(10 * value);
		if (updKnob) setKnob('mFreq', 10*value)
	    onUpdateModFrequency( 10 * value );
	    return;
	case 0x4a:
	case 'mid1':
	case 'modOsc1':
	    //$("modOsc1").setValue(100 * value);
		if (updKnob) setKnob('modOsc1', 100*value)
	    onUpdateModOsc1( 100 * value );
	    return;
	case 0x47:
	case 'low1':
	case 'modOsc2':
	    //$("modOsc2").setValue(100 * value);
		if (updKnob) setKnob('modOsc2', 100*value)
	    onUpdateModOsc2( 100 * value );
	    return;

	// Filter
	case 2:
	case 'trax':
		// -1|+1 -> 0..1
		const minlog = Math.log2(20)
		const maxlog = Math.log2(20000)
		value = (synth.currentFilterCutoff-minlog)/(maxlog-minlog) + value/50
		if (value > 1) value = 1
		if (value < 0) value = 0
	case 'fFreq':
		// 0..1 -> 20..20000 (log)
		//$("fFreq").setRatioValue(value);
		const min = Math.log2(20)
		const max = Math.log2(20000)
		if (updKnob) setKnob('fFreq', (max - min)*value + min ) // log scale ... value = 0..1
		onUpdateFilterCutoff( (max-min)*value + min );
		return;
	case 0x0a:
	case 7:
	case 'master':
	case 'fQ':
		// 0..1 -> 0..20
		//$("fQ").setValue(20*value);
		if (updKnob) setKnob('fQ', 20*value)
		onUpdateFilterQ( 20*value );
		return;
	case 1:
	case 'phones':
	case 'fMod':
		// 0..1 -> 0..100
		//$("fMod").setValue(100*value);
		if (updKnob) setKnob('fMod', 100*value)
		onUpdateFilterMod(100*value);	
		return;
	case 'mix':
	case 'fEnv':
		// 0..1 -> 0..100
		//$("fEnv").setRatioValue(value);
		//$("fEnv").setValue(100*value);
		if (updKnob) setKnob('fEnv', 100*value)
		onUpdateFilterEnv( 100*value );
		return;

	// master
	case 0x49:
	case 5:
	case 15:
	case 'low2':
	case 'drive':
				//$("drive").setValue(100 * value);
		if (updKnob) setKnob('drive', 100*value)
	    onUpdateDrive( 100 * value );
	    return;
	case 0x48:
	case 6:
	case 16:
	case 'mid2':
	case 'reverb':
	    //$("reverb").setValue(100 * value);
		if (updKnob) setKnob('reverb', 100*value)
	    onUpdateReverb( 100 * value );
	    return;
	case 0x5b:
	case 'hi2':
	case 'volume':
	    //$("volume").setValue(100 * value);
		if (updKnob) setKnob('volume', 100*value)
	    onUpdateVolume( 100 * value );
	    return;

	// filter envelope
	case 'fx21':
		value = synth.currentFilterEnvA/100 + value/100
		setKnob('fA', 100*value)
	case 'fA':
		onUpdateFilterEnvA(value*100)
		return
	case 'fx22':
		value = synth.currentFilterEnvD/100 + value/100
		setKnob('fD', 100*value)
	case 'fD':
		onUpdateFilterEnvD(value*100)
		return
	case 'fx23':
		value = synth.currentFilterEnvS/100 + value/100
		setKnob('fS', 100*value)
	case 'fS':
		onUpdateFilterEnvS(value*100)
		return
	case 'loop2':
		value = synth.currentFilterEnvR/100 + value/100
		setKnob('fR', 100*value)
	case 'fR':
		onUpdateFilterEnvR(value*100)
		return

	// volume envelope
	case 'fx41':
		value = synth.currentEnvA/100 + value/100
		setKnob('vA', 100*value)
	case 'vA':
		onUpdateEnvA(value*100)
		return
	case 'fx42':
		value = synth.currentEnvD/100 + value/100
		setKnob('vD', 100*value)
	case 'vD':
		onUpdateEnvD(value*100)
		return
	case 'fx43':
		value = synth.currentEnvS/100 + value/100
		setKnob('vS', 100*value)
	case 'vS':
		onUpdateEnvS(value*100)
		return
	case 'loop4':
		value = synth.currentEnvR/100 + value/100
		setKnob('vR', 100*value)
	case 'vR':
		onUpdateEnvR(value*100)
		return

	// unknown
	case 33: // "x1" button
	case 51:
		moDouble = (value > 0);
		changeModMultiplier();
	    return;
	case 34: // "x2" button
	case 52:
		moQuadruple = (value > 0);
		changeModMultiplier();
	    return;

	default:
		console.log('Unmapped:', number, value)
	}
}

// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
	var i;

	synth.currentPitchWheel = value;
	for (var i=0; i<255; i++) {
		if (voices[i]) {
			if (voices[i].osc1)
				voices[i].osc1.detune.value = synth.currentOsc1Detune + synth.currentPitchWheel * 500;	// value in cents - detune major fifth.
			if (voices[i].osc2)
				voices[i].osc2.detune.value = synth.currentOsc2Detune + synth.currentPitchWheel * 500;	// value in cents - detune major fifth.
		}
	}
}

function polyPressure( noteNumber, value ) {
	if (voices[noteNumber] != null) {
		voices[noteNumber].setFilterQ( value*20 );
	}
}

var waveforms = ["sine","square","sawtooth","triangle"];

synth.onUpdateModWaveform = ( ev ) => {
	var value = ev.currentTarget ? ev.currentTarget.selectedIndex : ev;
	synth.currentModWaveform = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setModWaveform( waveforms[synth.currentModWaveform] );
		}
	}
}

function onUpdateModFrequency( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentModFrequency = value;
	var oscFreq = synth.currentModFrequency * modOscFreqMultiplier;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModFrequency( oscFreq );
		}
	}
}

function onUpdateModOsc1( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentModOsc1 = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModOsc1( synth.currentModOsc1 );
		}
	}
}

function onUpdateModOsc2( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentModOsc2 = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModOsc2( synth.currentModOsc2 );
		}
	}
}

function onUpdateFilterCutoff( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	//console.log(value)
	console.log( "currentFilterCutoff= " + synth.currentFilterCutoff + "new cutoff= " + value );
	synth.currentFilterCutoff = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterCutoff( value );
		}
	}
}

function onUpdateFilterQ( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentFilterQ = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterQ( value );
		}
	}
}

function onUpdateFilterMod( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentFilterMod = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterMod( value );
		}
	}
}

function onUpdateFilterEnv( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	synth.currentFilterEnv = value;
}

function onUpdateOsc1Wave( ev ) {
	var value = ev.target ? ev.target.selectedIndex : ev;
	synth.currentOsc1Waveform = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setOsc1Waveform( waveforms[synth.currentOsc1Waveform] );
		}
	}
}

function onUpdateOsc1Octave( ev ) {
	var value = ev.target ? ev.target.selectedIndex : ev;
	synth.currentOsc1Octave = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Frequency();
		}
	}
}

function onUpdateOsc1Detune( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev
	synth.currentOsc1Detune = value
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Frequency()
		}
	}
}

function onUpdateOsc1Mix( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev
	synth.currentOsc1Mix = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Mix( value );
		}
	}
}

function onUpdateOsc2Wave( ev ) {
	var value = ev.target ? ev.target.selectedIndex : ev;
	synth.currentOsc2Waveform = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setOsc2Waveform( waveforms[synth.currentOsc2Waveform] );
		}
	}
}

function onUpdateOsc2Octave( ev ) {
	var value = ev.target ? ev.target.selectedIndex : ev;
	synth.currentOsc2Octave = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc2Frequency();
		}
	}
}

function onUpdateOsc2Detune( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev
	synth.currentOsc2Detune = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc2Frequency();
		}
	}
}

function onUpdateOsc2Mix( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev
	synth.currentOsc2Mix = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc2Mix( value );
		}
	}
}

function onUpdateEnvA( ev ) {
	synth.currentEnvA = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateEnvD( ev ) {
	synth.currentEnvD = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateEnvS( ev ) {
	synth.currentEnvS = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateEnvR( ev ) {
	synth.currentEnvR = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateFilterEnvA( ev ) {
	synth.currentFilterEnvA = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateFilterEnvD( ev ) {
	synth.currentFilterEnvD = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateFilterEnvS( ev ) {
	synth.currentFilterEnvS = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateFilterEnvR( ev ) {
	synth.currentFilterEnvR = ev.currentTarget ? ev.currentTarget.value : ev
}

function onUpdateDrive( value ) {
	synth.currentDrive = value
    waveshaper.setDrive( 0.01 + (synth.currentDrive*synth.currentDrive/500.0) );
}

function onUpdateVolume( ev ) {
	const val = (ev.currentTarget ? ev.currentTarget.value : ev) / 100
	synth.currentVol = val*100
	volNode.gain.value = val
}

function onUpdateReverb( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	value = value/100;

	// equal-power crossfade
	var gain1 = Math.cos(value * 0.5*Math.PI);
	var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

	revBypassGain.gain.value = gain1;
	revGain.gain.value = gain2;
	synth.currentRev = value*100;
}

/*
var FOURIER_SIZE = 2048;
var wave = false;

	if ( wave ) {
		var real = new Float32Array(FOURIER_SIZE);
		var imag = new Float32Array(FOURIER_SIZE);
		real[0] = 0.0;
		imag[0] = 0.0;

		for (var i=1; i<FOURIER_SIZE; i++) {
			real[i]=1.0;
			imag[i]=1.0;
		}

		var wavetable = audioContext.createWaveTable(real, imag);
		oscillatorNode.setWaveTable(wavetable);
	} else {

*/

function filterFrequencyFromCutoff( pitch, cutoff ) {
    var nyquist = 0.5 * audioContext.sampleRate;

//    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
    if (filterFrequency > nyquist)
        filterFrequency = nyquist;
	return filterFrequency;
}

function Voice( note, velocity ) {
	this.originalFrequency = frequencyFromNoteNumber( note );

	// create osc 1
	this.osc1 = audioContext.createOscillator();
	this.updateOsc1Frequency();
	this.osc1.type = waveforms[synth.currentOsc1Waveform];

	this.osc1Gain = audioContext.createGain();
	this.osc1Gain.gain.value = 0.005 * synth.currentOsc1Mix;
//	this.osc1Gain.gain.value = 0.05 + (0.33 * velocity);
	this.osc1.connect( this.osc1Gain );

	// create osc 2
	this.osc2 = audioContext.createOscillator();
	this.updateOsc2Frequency();
	this.osc2.type = waveforms[synth.currentOsc2Waveform];

	this.osc2Gain = audioContext.createGain();
	this.osc2Gain.gain.value = 0.005 * synth.currentOsc2Mix;
//	this.osc2Gain.gain.value = 0.05 + (0.33 * velocity);
	this.osc2.connect( this.osc2Gain );

	// create modulator osc
	this.modOsc = audioContext.createOscillator();
	this.modOsc.type = 	waveforms[synth.currentModWaveform];
	this.modOsc.frequency.value = synth.currentModFrequency * modOscFreqMultiplier;

	this.modOsc1Gain = audioContext.createGain();
	this.modOsc.connect( this.modOsc1Gain );
	this.modOsc1Gain.gain.value = synth.currentModOsc1/10;
	this.modOsc1Gain.connect( this.osc1.frequency );	// vibrato

	this.modOsc2Gain = audioContext.createGain();
	this.modOsc.connect( this.modOsc2Gain );
	this.modOsc2Gain.gain.value = synth.currentModOsc2/10;
	this.modOsc2Gain.connect( this.osc2.frequency );	// vibrato

	// create the LP filter
	this.filter1 = audioContext.createBiquadFilter();
	this.filter1.type = "lowpass";
	this.filter1.Q.value = synth.currentFilterQ;
	this.filter1.frequency.value = Math.pow(2, synth.currentFilterCutoff); 
	// filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff );
//	console.log( "filter frequency: " + this.filter1.frequency.value);
	this.filter2 = audioContext.createBiquadFilter();
	this.filter2.type = "lowpass";
	this.filter2.Q.value = synth.currentFilterQ;
	this.filter2.frequency.value = Math.pow(2, synth.currentFilterCutoff); 

	this.osc1Gain.connect( this.filter1 );
	this.osc2Gain.connect( this.filter1 );
	this.filter1.connect( this.filter2 );

	// connect the modulator to the filters
	this.modFilterGain = audioContext.createGain();
	this.modOsc.connect( this.modFilterGain );
	this.modFilterGain.gain.value = synth.currentFilterMod*24;
//	console.log("modFilterGain=" + currentFilterMod*24);
	this.modFilterGain.connect( this.filter1.detune );	// filter vibrato
	this.modFilterGain.connect( this.filter2.detune );	// filter vibrato

	// create the volume envelope
	this.envelope = audioContext.createGain();
	this.filter2.connect( this.envelope );
	this.envelope.connect( effectChain );

	// set up the volume and filter envelopes
	var now = audioContext.currentTime;
	var envAttackEnd = now + (synth.currentEnvA/20.0);

	this.envelope.gain.value = 0.0;
	this.envelope.gain.setValueAtTime( 0.0, now );
	this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
	this.envelope.gain.setTargetAtTime( (synth.currentEnvS/100.0), envAttackEnd, (synth.currentEnvD/100.0)+0.001 );

	var filterAttackLevel = synth.currentFilterEnv*72;  // Range: 0-7200: 6-octave range
	var filterSustainLevel = filterAttackLevel* synth.currentFilterEnvS / 100.0; // range: 0-7200
	var filterAttackEnd = (synth.currentFilterEnvA/20.0);

/*	console.log( "filterAttackLevel: " + filterAttackLevel + 
				 " filterSustainLevel: " + filterSustainLevel +
				 " filterAttackEnd: " + filterAttackEnd);
*/
	if (!filterAttackEnd) 
				filterAttackEnd=0.05; // tweak to get target decay to work properly
	this.filter1.detune.setValueAtTime( 0, now );
	this.filter1.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );
	this.filter2.detune.setValueAtTime( 0, now );
	this.filter2.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );
	this.filter1.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (synth.currentFilterEnvD/100.0) );
	this.filter2.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (synth.currentFilterEnvD/100.0) );

	this.osc1.start(0);
	this.osc2.start(0);
	this.modOsc.start(0);
}

Voice.prototype.setModWaveform = function( value ) {
	this.modOsc.type = value;
}

Voice.prototype.updateModFrequency = function( value ) {
	this.modOsc.frequency.value = value;
}

Voice.prototype.updateModOsc1 = function( value ) {
	this.modOsc1Gain.gain.value = value/10;
}

Voice.prototype.updateModOsc2 = function( value ) {
	this.modOsc2Gain.gain.value = value/10;
}

Voice.prototype.setOsc1Waveform = function( value ) {
	this.osc1.type = value;
}

Voice.prototype.updateOsc1Frequency = function( value ) {
	this.osc1.frequency.value = (this.originalFrequency*Math.pow(2,synth.currentOsc1Octave-2));  // -2 because osc1 is 32', 16', 8'
	this.osc1.detune.value = synth.currentOsc1Detune + synth.currentPitchWheel * 500;	// value in cents - detune major fifth.
}

Voice.prototype.updateOsc1Mix = function( value ) {
	this.osc1Gain.gain.value = 0.005 * value;
}

Voice.prototype.setOsc2Waveform = function( value ) {
	this.osc2.type = value;
}

Voice.prototype.updateOsc2Frequency = function( value ) {
	this.osc2.frequency.value = (this.originalFrequency*Math.pow(2,synth.currentOsc2Octave-1));
	this.osc2.detune.value = synth.currentOsc2Detune + synth.currentPitchWheel * 500;	// value in cents - detune major fifth.
}

Voice.prototype.updateOsc2Mix = function( value ) {
	this.osc2Gain.gain.value = 0.005 * value;
}

Voice.prototype.setFilterCutoff = function( value ) {
	//var now = audioContext.currentTime;
	var filterFrequency = Math.pow(2, value);
//	console.log("Filter cutoff: orig:" + this.filter1.frequency.value + " new:" + filterFrequency + " value: " + value );
	this.filter1.frequency.value = filterFrequency;
	this.filter2.frequency.value = filterFrequency;
}

Voice.prototype.setFilterQ = function( value ) {
	this.filter1.Q.value = value;
	this.filter2.Q.value = value;
}

Voice.prototype.setFilterMod = function( value ) {
	this.modFilterGain.gain.value = synth.currentFilterMod*24;
//	console.log( "filterMod.gain=" + currentFilterMod*24);
}

Voice.prototype.noteOff = function() {
	var now =  audioContext.currentTime;
	var release = now + (synth.currentEnvR/10.0);
    var initFilter = filterFrequencyFromCutoff( this.originalFrequency, synth.currentFilterCutoff/100 * (1.0-(synth.currentFilterEnv/100.0)) );

//    console.log("noteoff: now: " + now + " val: " + this.filter1.frequency.value + " initF: " + initFilter + " fR: " + currentFilterEnvR/100 );
	this.envelope.gain.cancelScheduledValues(now);
	this.envelope.gain.setValueAtTime( this.envelope.gain.value, now );  // this is necessary because of the linear ramp
	this.envelope.gain.setTargetAtTime(0.0, now, (synth.currentEnvR/100));
	this.filter1.detune.cancelScheduledValues(now);
	this.filter1.detune.setTargetAtTime( 0, now, (synth.currentFilterEnvR/100.0) );
	this.filter2.detune.cancelScheduledValues(now);
	this.filter2.detune.setTargetAtTime( 0, now, (synth.currentFilterEnvR/100.0) );

	this.osc1.stop( release );
	this.osc2.stop( release );
}

var currentOctave = 3;
var modOscFreqMultiplier = 1;
var moDouble = false;
var moQuadruple = false;

function changeModMultiplier() {
	modOscFreqMultiplier = (moDouble?2:1)*(moQuadruple?4:1);
	onUpdateModFrequency( synth.currentModFrequency );
}

// ToDo: this needs to be moved into an input class
function keyDown( ev ) {
	console.log(ev.key, ev.keyCode, ev.code, ev)
	if ((ev.keyCode==49)||(ev.keyCode==50)) {
		if (ev.keyCode==49)
			moDouble = true;
		else if (ev.keyCode==50)
			moQuadruple = true;
		changeModMultiplier();
	}

	var note = keys[ev.keyCode];
	if (note)
		synth.noteOn( note + 12*(3-currentOctave), 0.75 );
	//console.log( "key down: " + ev.keyCode );

	return false;
}

function keyUp( ev ) {
	if ((ev.keyCode==49)||(ev.keyCode==50)) {
		if (ev.keyCode==49)
			moDouble = false;
		else if (ev.keyCode==50)
			moQuadruple = false;
		changeModMultiplier();
	}

	var note = keys[ev.keyCode];
	if (note)
	synth.noteOff( note + 12*(3-currentOctave) );
//	console.log( "key up: " + ev.keyCode );

	return false;
}
var pointers=[];

synth.touchstart = ( ev ) => {
	for (var i=0; i<ev.targetTouches.length; i++) {
	    var touch = ev.targetTouches[0];
		var element = touch.target;

		var note = parseInt( element.id.substring( 1 ) );
		console.log( "touchstart: id: " + element.id + "identifier: " + touch.identifier + " note:" + note );
		if (!isNaN(note)) {
			synth.noteOn( note + 12*(3-currentOctave), 0.75 );
			var keybox = document.getElementById("keybox")
			pointers[touch.identifier]=note;
		}
	}
	ev.preventDefault();
}

synth.touchmove = ( ev ) => {
	for (var i=0; i<ev.targetTouches.length; i++) {
	    var touch = ev.targetTouches[0];
		var element = touch.target;

		var note = parseInt( element.id.substring( 1 ) );
		console.log( "touchmove: id: " + element.id + "identifier: " + touch.identifier + " note:" + note );
		if (!isNaN(note) && pointers[touch.identifier] && pointers[touch.identifier]!=note) {
			synth.noteOff(pointers[touch.identifier] + 12*(3-currentOctave));
			synth.noteOn( note + 12*(3-currentOctave), 0.75 );
			var keybox = document.getElementById("keybox")
			pointers[touch.identifier]=note;
		}
	}
	ev.preventDefault();
}

synth.touchend = ( ev ) => {
	var note = parseInt( ev.target.id.substring( 1 ) );
	console.log( "touchend: id: " + ev.target.id + " note:" + note );
	if (note != NaN)
	synth.noteOff( note + 12*(3-currentOctave) );
	pointers[ev.pointerId]=null;
	var keybox = document.getElementById("keybox")
	ev.preventDefault();
}

synth.touchcancel = ( ev ) => {
	console.log( "touchcancel" );
	ev.preventDefault();
}

synth.pointerDown = ( ev ) => {
	//var note = parseInt( ev.target.id.substring( 1 ) );
	//console.log('pointerDown', ev)
	const note = Array.from(ev.target.parentNode.children).indexOf(ev.target) + 36
	//console.log( "pointer down: id: " + ev.pointerId + " target: " + ev.target.id + " note:" + note );
	if (!isNaN(note)) {
		synth.noteOn( note + 12*(3-currentOctave), 0.75 );
		var keybox = document.getElementById("keybox")
		pointers[ev.pointerId]=note;
	}
	ev.preventDefault();
}

synth.pointerMove = ( ev ) => {
	//var note = parseInt( ev.target.id.substring( 1 ) );
	const note = Array.from(ev.target.parentNode.children).indexOf(ev.target) + 36
	//console.log( "pointer move: id: " + ev.pointerId + " target: " + ev.target.id + " note:" + note );
	if (!isNaN(note) && pointers[ev.pointerId] && pointers[ev.pointerId]!=note) {
		if (pointers[ev.pointerId])
		synth.noteOff(pointers[ev.pointerId] + 12*(3-currentOctave));
		synth.noteOn( note + 12*(3-currentOctave), 0.75 );
		pointers[ev.pointerId]=note;
	}
	ev.preventDefault();
}

synth.pointerUp = ( ev ) => {
	//var note = parseInt( ev.target.id.substring( 1 ) );
	const note = Array.from(ev.target.parentNode.children).indexOf(ev.target) + 36
	//console.log( "pointer up: id: " + ev.pointerId + " note:" + note );
	if (note != NaN)
	synth.noteOff( note + 12*(3-currentOctave) );
	pointers[ev.pointerId]=null;
	var keybox = document.getElementById("keybox")
	ev.preventDefault();
}


synth.onChangeOctave = (ev) => {
	currentOctave = ev.target.selectedIndex
}


function initAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	try {
    	audioContext = new AudioContext();
  	}
  	catch(e) {
    	alert('The Web Audio API is apparently not supported in this browser.');
  	}

	window.addEventListener('keydown', keyDown, false);
	window.addEventListener('keyup', keyUp, false);
	// changes DrS: setupSynthUI();

	isMobile = (navigator.userAgent.indexOf("Android")!=-1)||(navigator.userAgent.indexOf("iPad")!=-1)||(navigator.userAgent.indexOf("iPhone")!=-1);

	// set up the master effects chain for all voices to connect to.
	effectChain = audioContext.createGain();
	waveshaper = new WaveShaper( audioContext );
    effectChain.connect( waveshaper.input );
    onUpdateDrive( synth.currentDrive );

    if (!isMobile)
    	revNode = audioContext.createConvolver();
    else
    	revNode = audioContext.createGain();
	revGain = audioContext.createGain();
	revBypassGain = audioContext.createGain();

    volNode = audioContext.createGain();
    volNode.gain.value = synth.currentVol;
    compressor = audioContext.createDynamicsCompressor();
    waveshaper.output.connect( revNode );
    waveshaper.output.connect( revBypassGain );
    revNode.connect( revGain );
    revGain.connect( volNode );
    revBypassGain.connect( volNode );
    onUpdateReverb( synth.currentRev )

    volNode.connect( compressor );
    compressor.connect(	audioContext.destination );
    onUpdateVolume( synth.currentVol );

    if (!isMobile) {
	  	var irRRequest = new XMLHttpRequest();
		irRRequest.open("GET", "sounds/irRoom.wav", true);
		irRRequest.responseType = "arraybuffer";
		irRRequest.onload = function() {
	  		audioContext.decodeAudioData( irRRequest.response, 
	  			function(buffer) { if (revNode) revNode.buffer = buffer; else console.log("no revNode ready!")} );
		}
		irRRequest.send();
	}

}
/*
if('serviceWorker' in navigator) {  
  navigator.serviceWorker  
           .register('./service-worker.js')  
           .then(function() { console.log('Service Worker Registered'); });  
}
*/
window.onload=initAudio;
