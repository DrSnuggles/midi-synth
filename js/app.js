/* DrSnuggles

*/

import {synth} from './synth.js'
import {setupSynthUI} from './ui.js'
import {midi} from './midi.js'
midi.callback = (o) => {
	if (o.dj) {
		synth.controller(o.dj.key, o.dj.val, true)
	}
	if (o.key) {
		if (o.key.noteOff) synth.noteOff(o.key.noteOff)
		if (o.key.noteOn) synth.noteOn(o.key.noteOn, o.key.vel)
	}
}

//
// Force SSL, else AudioWorklet wont work
// also done on server side
if (location.protocol !== 'https:') location.replace(`https:${location.href.substring(location.protocol.length)}`)

//
// Init
//
document.body.innerHTML = `<div id="synthbox"></div>
<div id="keybox" class="fadeIn">
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>

	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>

	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>

	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>

	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>
	<div class="key black"></div>
	<div class="key white"></div>

	<div class="key white"></div>
</div>
<div id="MIDIPlugin"></div>

<footer><a title="℗2022 DrSnuggles/Gnax" href="https://DrSnuggles.github.io" target="_blank">℗2022 DrSnuggles/Gnαχ</a> &middot; <a title="©2018 Chris Wilson" href="https://github.com/cwilso/midi-synth" target="_blank">©2018 Chris Wilson</a></footer>`
setupSynthUI(synth)