# MIDI Synth

## Final thoughts
I stopped but we had a lot of fun with it and still love to play some Carpenter tunes :)

Tbh i dislike the piano and deck around me and prefer using mouse and keyboard even if i lose velocity.

## Thanks to
- Chris Wilson for the most code
- Colin Bone Dodds for the knobs

## DrSnuggles rework
Tried to combine my own approach and this nicer looking one.
Not sure if i keep PWA idea.
Renewed knob images and switched to webp.
Want to get rid of polymer and just keep knob.
Knob... The knobs..... THE KNOB. specially the cutoff freq knob which is the only log one.
I also started wondering if the step size of 1.0 is like real Synths did?? ??
Idea: Make it analog again. i will do with knob code, as this is more a knob without too much audio logic inside. Next issue for virtual piano and knobs is leaving window while mous button pressed.
But first i will try to make it work again.

## Differences
- Removed PWA
- Removed Polymer
- Reworked knobs a bit
- VanillaJS
- ES6 Import/Export
- Digital Jockey DJ Deck MIDI input
- Wider piano (matches the one i have here)
- Persistent settings

## Knob
- log scale
- step size
- min / max / 50% displays wrong images (first, last, mid)

## Idea
I have a midi dj deck i do not use and want to build a digital synth out of the knobs.

I also have a midi piano and in combination that should be nice hardware input.

## UI
Want nice knobs

## Links
Main Source: https://github.com/cwilso/midi-synth

Midi: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
Midi mapping: https://mixxx.discourse.group/uploads/short-url/1VLmkMF2mULTDv1if3M358RIUgh.zip
Reloop: https://www.reloop.com/reloop-digital-jockey-2-me

https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3

https://www.mu-sig.de/Theorie/Notation/Notation02.htm

https://github.com/keithwhor/audiosynth/blob/master/audiosynth.js

https://keithwhor.com/music/

https://www.midi.org/specifications-old/item/table-2-expanded-messages-list-status-bytes

https://github.com/g200kg/webaudio-controls

https://github.com/ColinBD/JSAudioKnobs

https://css-tricks.com/how-to-code-a-playable-synth-keyboard/

https://djjondent.blogspot.com/2014/05/modular-synthesizer-panel-diensions-or.html

https://www.earlevel.com/main/2013/06/23/envelope-generators-adsr-widget/


## Chris
https://github.com/cwilso/midi-synth

This application is a analog synthesizer simulation built on the [Web Audio API](https://webaudio.github.io/web-audio-api/).  It is very loosely based on the architecture of a [Moog Prodigy](http://www.vintagesynth.com/moog/prodigy.php) synthesizer, although this is a polyphonic synthesizer, and it lacks the oscillator sync and glide effects of the Prodigy.  (AKA: this is not intended to be a replication of the Prodigy, so pleased don't tell me how crappy a reproduction it is! :)

This uses my [Web MIDI Polyfill](https://github.com/cwilso/WebMIDIAPIShim) to add MIDI support via the [Web MIDI API](http://webaudio.github.io/web-midi-api/) - in fact, I partly wrote this as a test case for the polyfill and the MIDI API itself, so if you have a MIDI keyboard attached, check it out.  The polyfill uses Java to access the MIDI device, so if you're wondering why Java is loading, that's why.  It may take a few seconds for MIDI to become active - the library takes a while to load - but when the ring turns gray (instead of blue), it's ready.  If you have a native implementation of the Web MIDI API in your browser, the polyfill shouldn't load - at the time of this writing, Chrome Stable (from version 43) has the only such implementation. Earlier versions of Chrome (from version 33) can enable Web MIDI via chrome://flags/#enable-web-midi

You can try it out live at https://webaudiodemos.appspot.com/midi-synth/index.html.

## License
Chris: Check it out, feel free to fork, submit pull requests, etc.
DrSnuggles: Have fun!
