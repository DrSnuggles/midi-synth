import {Knob} from './knobs.js'
import { synth } from './synth.js';

window.knobs = [] // not perfect
window.knobChanged = (id, val) => {
	console.log(`knob with ID: ${id} changed to ${val}`);
	synth.controller(id, val, false)
}

function createKnob( id, label, width, x, y, min, max, currentValue, color, onChange, units, log ) {

	const container = document.createElement( "div" )
	container.className = "knobContainer"
	container.style.left = x + "px"
	container.style.top = y + "px"
	
	const knob = document.createElement( "div" )
	knob.className = "knob"
	knob.id = id
	knob.onchange = onChange
	//knob.setValue( currentValue )
	
	/*
	knob.setAttribute( "value", "" + currentValue )
	//knob.setAttribute( "src", "img/LittlePhatty_128.webp" )
	knob.setAttribute( "src", "img/LittlePhatty.webp" )
	knob.setAttribute( "min", ""+min )
	knob.setAttribute( "max", ""+max )
	if (log)
	knob.setAttribute( "log", true )
	else
	knob.setAttribute( "step", (max-min)/100 )
	if (units)
	knob.setAttribute("units", units)
	knob.setAttribute( "diameter", "64" )
	//knob.setAttribute( "sprites", "50" )
	knob.setAttribute( "sprites", "100" )
	knob.setAttribute( "tooltip", label )
	//knob.ready()
	knob.onchange = onChange
	*/
	//	knob.setValue( currentValue )
	
	
	
	var labelText = document.createElement( "div" )
	labelText.className = "knobLabel"
	labelText.style.top = "" + (75* 0.85) + "px"
	labelText.style.width = "" + width + "px"
	labelText.appendChild( document.createTextNode( label ) )
	
	container.appendChild( knob )
	container.appendChild( labelText )
	
	//	$( knob ).knob({ 'change' : onChange })
	
	return container
}

function createDropdown( id, label, x, y, values, selectedIndex, onChange ) {
	var container = document.createElement( "div" )
	container.className = "dropdownContainer"
	container.style.left = "" + x + "px"
	container.style.top = "" + y + "px"

	var labelText = document.createElement( "div" )
	labelText.className = "dropdownLabel"
	labelText.appendChild( document.createTextNode( label ) )
	container.appendChild( labelText )

	var select = document.createElement( "select" )
	select.className = "dropdownSelect"
	select.id = id
	for (var i=0; i<values.length; i++) {
		var opt = document.createElement("option")
		opt.appendChild(document.createTextNode(values[i]))
		select.appendChild(opt)
	}
	select.selectedIndex = selectedIndex
	select.onchange = onChange
	container.appendChild( select )

	return container
}

function createSection( label, x, y, width, height ) {
	var container = document.createElement( "fieldset" )
	container.className = "section"
	container.style.left = "" + x + "px"
	container.style.top = "" + y + "px"
	container.style.width = "" + width + "px"
	container.style.height = "" + height + "px"

	var labelText = document.createElement( "legend" )
	labelText.className = "sectionLabel"
	labelText.appendChild( document.createTextNode( label ) )

	container.appendChild( labelText )
	return container
}

export function setupSynthUI(synth) {
	const synthBox = document.getElementById("synthbox")
	/* new design idea: make it look more like djme2
	left side OSC1 and OSC2
	mit MOD, Filter, Master
	right side actual unused but could be hooked up to osc 3+4 or other things, digin deeper into synthy stuff :)
	10 border + 220 + 90 + 90 + ...

	Width is usually measured in units of TE (TeilungsEinheiten, german.) or HP (Horizontal Pitch)
	One TE/HP = 5.08mm = 0.2inches or 1/5"

	Height is usually measured in terms of  HE (HöhenEinheit, german.). or units (U, english)
	One U = 44.45mm = 1.75 inches.
	Between 3U and 6U is most common

	Screen is mostly 96dpi. Can check if we create a div with height one inch and then get offsetHeight
	Height: multiple of 168px usally 504-1008px
	Width: multiple of 19,2px 

	*/
	let tmp = createSection( "OSC1", 10, 10, 220, 160 )
	tmp.appendChild( createDropdown( "osc1wave", "waveform", 10, 15, ["sine","square", "saw", "triangle"/*, "wavetable"*/], synth.currentOsc1Waveform, synth.onUpdateOsc1Wave ))
	tmp.appendChild( createDropdown( "osc1int", "interval",  140, 15, ["32'","16'", "8'"], synth.currentOsc1Octave, synth.onUpdateOsc1Octave ) )
	tmp.appendChild( createKnob(     "osc1detune", "detune", 100, 10, 65, -1200, 1200, synth.currentOsc1Detune, "blue", synth.onUpdateOsc1Detune ) )
	tmp.appendChild( createKnob(     "osc1mix", "mix",       100, 130, 65, 0, 100, synth.currentOsc1Mix, "blue", synth.onUpdateOsc1Mix ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'osc1detune', lowVal: -1200, highVal: 1200, value: synth.currentOsc1Detune}),
		new Knob({id: 'osc1mix',    lowVal:     0, highVal:  100, value: synth.currentOsc1Mix})
	)

	tmp = createSection( "OSC2", 10, 192, 220, 160 )
	tmp.appendChild( createDropdown( "osc2wave", "waveform", 10, 15, ["sine","square", "saw", "triangle"/*, "wavetable"*/], synth.currentOsc2Waveform, synth.onUpdateOsc2Wave ))
	tmp.appendChild( createDropdown( "osc2int", "interval", 140, 15, ["16'","8'", "4'"], synth.currentOsc2Octave, synth.onUpdateOsc2Octave ) )
	tmp.appendChild( createKnob( "osc2detune", "detune", 100, 10, 65, -1200, 1200, synth.currentOsc2Detune, "blue", synth.onUpdateOsc2Detune ) )
	tmp.appendChild( createKnob( "osc2mix", "mix", 100, 130, 65, 0, 100, synth.currentOsc2Mix, "blue", synth.onUpdateOsc2Mix ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'osc2detune', lowVal: -1200, highVal: 1200, value: synth.currentOsc2Detune}),
		new Knob({id: 'osc2mix',    lowVal:     0, highVal:  100, value: synth.currentOsc2Mix})
	)

	tmp = createSection( "mod", 260, 10, 90, 342 )
	tmp.appendChild( createDropdown( "modwave", "shape", 12, 15, ["sine","square", "saw", "triangle"], synth.currentModWaveform, synth.onUpdateModWaveform ))
	tmp.appendChild( createKnob( "mFreq", "freq", 80, 12, 65, 0, 10, synth.currentModFrequency, "#c10087", synth.onUpdateModFrequency ) )
	tmp.appendChild( createKnob( "modOsc1", "osc1 vibrato", 80, 12, 160, 0, 100, synth.currentModOsc1, "#c10087", synth.onUpdateModOsc1 ) )
	tmp.appendChild( createKnob( "modOsc2", "osc2 vibrato", 80, 12, 255, 0, 100, synth.currentModOsc2, "#c10087", synth.onUpdateModOsc2 ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'mFreq',   lowVal: 0, highVal:  10, value: synth.currentModFrequency}),
		new Knob({id: 'modOsc1', lowVal: 0, highVal: 100, value: synth.currentModOsc1}),
		new Knob({id: 'modOsc2', lowVal: 0, highVal: 100, value: synth.currentModOsc2})
	)

	tmp = createSection( "filter", 380, 10, 90, 342 )
	tmp.appendChild( createKnob( "fFreq", "cutoff", 75, 12, 10, 20, 20000, Math.pow(2,synth.currentFilterCutoff), "#ffaa00", synth.onUpdateFilterCutoff, "Hz", true ) )
	tmp.appendChild( createKnob( "fQ", "q",       75, 12, 95, 0, 20, synth.currentFilterQ, "#ffaa00", synth.onUpdateFilterQ ) )
	tmp.appendChild( createKnob( "fMod", "mod",   75, 12, 180, 0, 100, synth.currentFilterMod, "#ffaa00", synth.onUpdateFilterMod ) )
	tmp.appendChild( createKnob( "fEnv", "env",   75, 12, 265, 0, 100, synth.currentFilterEnv, "#ffaa00", synth.onUpdateFilterEnv ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'fFreq', lowVal: Math.log2(20), highVal: Math.log2(20000), value: synth.currentFilterCutoff, valFunc: (val)=>{return Math.pow(2,val).toFixed(0)} }),
		new Knob({id: 'fQ',    lowVal:  0, highVal:    20, value: synth.currentFilterQ}),
		new Knob({id: 'fMod',  lowVal:  0, highVal:   100, value: synth.currentFilterMod}),
		new Knob({id: 'fEnv',  lowVal:  0, highVal:   100, value: synth.currentFilterEnv})
	)

	tmp = createSection( "master", 500, 10, 90, 342 )
	tmp.appendChild( createDropdown( "kbd_oct", "kbd_oct", 12, 15, ["+3", "+2","+1", "normal", "-1", "-2", "-3"], 3, synth.onChangeOctave ) )
	tmp.appendChild( createKnob( "volume", "volume",     80,  12, 65, 0, 100, synth.currentVol, "yellow", synth.onUpdateVolume ) )
	tmp.appendChild( createKnob( "reverb", "reverb",     80,  12, 160, 0, 100, synth.currentRev, "yellow", synth.onUpdateReverb ) )
	tmp.appendChild( createKnob( "drive", "drive",    80,   12, 255, 0, 100, synth.currentDrive, "yellow", synth.onUpdateDrive ) )
	//tmp.appendChild( createDropdown( "midiIn", "midi_in", 280, 15, ["-no MIDI-"], 0, selectMIDIIn ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'drive',  lowVal: 0, highVal: 100, value: synth.currentDrive}),
		new Knob({id: 'reverb', lowVal: 0, highVal: 100, value: synth.currentRev}),
		new Knob({id: 'volume', lowVal: 0, highVal: 100, value: synth.currentVol})
	)

	// the 2 ADSR knobs
	tmp = createSection( "filt-Env", 620, 10, 150, 160)
	tmp.appendChild( createKnob( "fA", "attack",  80,   0, 0, 0, 100, synth.currentFilterEnvA, "#bf8f30", synth.onUpdateFilterEnvA ) )
	tmp.appendChild( createKnob( "fD", "decay",   80,  80, 0, 0, 100, synth.currentFilterEnvD, "#bf8f30", synth.onUpdateFilterEnvD ) )
	tmp.appendChild( createKnob( "fS", "sustain", 80,  0, 80, 0, 100, synth.currentFilterEnvS, "#bf8f30", synth.onUpdateFilterEnvS ) )
	tmp.appendChild( createKnob( "fR", "release", 80,  80, 80, 0, 100, synth.currentFilterEnvR, "#bf8f30", synth.onUpdateFilterEnvR ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'fA', lowVal: 0, highVal: 100, value: synth.currentFilterEnvA}),
		new Knob({id: 'fD', lowVal: 0, highVal: 100, value: synth.currentFilterEnvD}),
		new Knob({id: 'fS', lowVal: 0, highVal: 100, value: synth.currentFilterEnvS}),
		new Knob({id: 'fR', lowVal: 0, highVal: 100, value: synth.currentFilterEnvR})
	)

	tmp = createSection( "vol-Env", 620, 190, 150, 160)
	tmp.appendChild( createKnob( "vA", "attack",  80,   0, 0, 0, 100, synth.currentEnvA, "#00b358", synth.onUpdateEnvA ) )
	tmp.appendChild( createKnob( "vD", "decay",   80,  80, 0, 0, 100, synth.currentEnvD, "#00b358", synth.onUpdateEnvD ) )
	tmp.appendChild( createKnob( "vS", "sustain", 80,  0, 80, 0, 100, synth.currentEnvS, "#00b358", synth.onUpdateEnvS ) )
	tmp.appendChild( createKnob( "vR", "release", 80,  80, 80, 0, 100, synth.currentEnvR, "#00b358", synth.onUpdateEnvR ) )
	synthBox.appendChild( tmp )
	knobs.push(
		new Knob({id: 'vA', lowVal: 0, highVal: 100, value: synth.currentEnvA}),
		new Knob({id: 'vD', lowVal: 0, highVal: 100, value: synth.currentEnvD}),
		new Knob({id: 'vS', lowVal: 0, highVal: 100, value: synth.currentEnvS}),
		new Knob({id: 'vR', lowVal: 0, highVal: 100, value: synth.currentEnvR})
	)

	const keybox = document.getElementById("keybox")

	if (window.location.search.substring(1) == "touch") {
		keybox.addEventListener('touchstart', synth.touchstart)
		keybox.addEventListener('touchmove', synth.touchmove)
		keybox.addEventListener('touchend', synth.touchend)
	} else {
		keybox.addEventListener('down', synth.pointerDown)
		keybox.addEventListener('track', synth.pointerMove)
		keybox.addEventListener('up', synth.pointerUp)

		keybox.addEventListener('mousedown', synth.pointerDown)
		keybox.addEventListener('mousemove', synth.pointerMove)
		keybox.addEventListener('mouseup', synth.pointerUp)
	}
}
