/*
	Digital Jockey Master Edition 2 MIDI Translator by DrSnuggles

	2022-03-11:
	shift keys are per side
	cross fader, master, phones mix and front panel knobs are not affected by shift
	trax is affected by both shifts, the button function is not affected
	the rest (all buttons, knobs, faders) are affected by shift key for that side
	so the complete dcks are there 4 times by midi not by later software
*/

export const djme2 = {
	leds: {
		sync1: 0x01,
		keylock1: 0x02,
		minus1: 0x03,
		plus1: 0x04,
		pfl1: 0x05,
		activ11: 0x07,
		activ13: 0x09,
		shift1: 0x0a,
		activ12: 0x0c,
		flanger1: 0x0e,
		in1: 0x0f,
		out1: 0x10,
		autoloop1: 0x11,
		loop1: 0x12,
		load1: 0x13,
		hi1: 0x14,
		mid1: 0x15,
		low1: 0x16,
		cup1: 0x17,
		cue1: 0x18,
		play1: 0x19,
		search1: 0x1a,
		scratch1: 0x1b,
		dry1: 0x1c,

		sync2: 0x3d,
		keylock2: 0x3e,
		minus2: 0x03f,
		plus2: 0x40,
		pfl2: 0x41,
		activ22: 0x43,
		flanger2: 0x45,
		shift2: 0x46,
		activ21: 0x48,
		activ23: 0x4a,
		in2: 0x4b,
		out2: 0x4c,
		autoloop2: 0x4d,
		loop2: 0x4e,
		load2: 0x4f,
		hi2: 0x50,
		mid2: 0x51,
		low2: 0x52,
		cup2: 0x53,
		cue2: 0x54,
		play2: 0x55,
		search2: 0x56,
		scratch2: 0x57,
		dry2: 0x58,
	},

	translateEvent: (ev) => {
		const dat = [...ev.data]
		//console.log(`Status=${dat[0].toString(16)} Midino=${dat[1].toString(16)} val=${dat[2].toString(16)}`)
	
		//
		// 2x 10 bit faders 0000..7f7f
		//
		if (dat[0] == 0xe0) return {pitchFader1: (dat[2]*0x100 + dat[1]) / 0x7f7f}
		if (dat[0] == 0xe1) return {pitchFader2: (dat[2]*0x100 + dat[1]) / 0x7f7f}
		if (dat[0] == 0xe2) return {pitchFader3: (dat[2]*0x100 + dat[1]) / 0x7f7f} // shifted
		if (dat[0] == 0xe3) return {pitchFader4: (dat[2]*0x100 + dat[1]) / 0x7f7f} // shifted

		// 
		// 18x 7 bit faders 00..7f
		//
		if (dat[0] == 0xb0) {
			const val = dat[2] / 0x7f
			if (dat[1] == 0x02) return {gain1: val}
			if (dat[1] == 0x03) return {hi1: val}
			if (dat[1] == 0x04) return {mid1: val}
			if (dat[1] == 0x05) return {low1: val}
			if (dat[1] == 0x06) return {volume1: val}

			if (dat[1] == 0x0f) return {master: val}
			if (dat[1] == 0x10) return {phones: val}
			if (dat[1] == 0x11) return {mix: val}
			if (dat[1] == 0x12) return {crossFader: val}

			if (dat[1] == 0x15) return {crossFaderCurve: val} // frontPanel
			if (dat[1] == 0x16) return {phoneTone: val} // frontPanel
			if (dat[1] == 0x17) return {micLevel: val} // frontPanel
			if (dat[1] == 0x18) return {micTone: val} // frontPanel

			if (dat[1] == 0x20) return {gain3: val} // shifted
			if (dat[1] == 0x21) return {hi3: val} // shifted
			if (dat[1] == 0x22) return {mid3: val} // shifted
			if (dat[1] == 0x23) return {low3: val} // shifted
			if (dat[1] == 0x24) return {volume3: val} // shifted

			if (dat[1] == 0x3e) return {gain2: val}
			if (dat[1] == 0x3f) return {hi2: val}
			if (dat[1] == 0x40) return {mid2: val}
			if (dat[1] == 0x41) return {low2: val}
			if (dat[1] == 0x42) return {volume2: val}

			if (dat[1] == 0x5c) return {gain4: val} // shifted
			if (dat[1] == 0x5d) return {hi4: val} // shifted
			if (dat[1] == 0x5e) return {mid4: val} // shifted
			if (dat[1] == 0x5f) return {low4: val} // shifted
			if (dat[1] == 0x60) return {volume4: val} // shifted
		}

		//
		// 11x +1 | -1
		//
		if (dat[0] == 0xb0) {
			const val = (dat[2] == 0x41) ? 1 : -1
			if (dat[1] == 0x07) return {fx11: val}
			if (dat[1] == 0x08) return {fx12: val}
			if (dat[1] == 0x09) return {fx13: val}
			if (dat[1] == 0x0a) return {loop1: val}
			if (dat[1] == 0x0b) return {jog1: val}

			if (dat[1] == 0x13) return {trax: val}

			if (dat[1] == 0x25) return {fx31: val} // shifted
			if (dat[1] == 0x26) return {fx32: val} // shifted
			if (dat[1] == 0x27) return {fx33: val} // shifted
			if (dat[1] == 0x28) return {loop3: val} // shifted
			if (dat[1] == 0x29) return {jog3: val} // shifted

			if (dat[1] == 0x31) return {traxShifted: val} // shifted

			if (dat[1] == 0x43) return {fx22: val}
			if (dat[1] == 0x44) return {fx21: val}
			if (dat[1] == 0x45) return {loop2: val}
			if (dat[1] == 0x46) return {fx23: val}
			if (dat[1] == 0x47) return {jog2: val}

			if (dat[1] == 0x61) return {fx42: val} // shifted
			if (dat[1] == 0x62) return {fx41: val} // shifted
			if (dat[1] == 0x63) return {loop4: val} // shifted
			if (dat[1] == 0x64) return {fx43: val} // shifted
			if (dat[1] == 0x65) return {jog4: val} // shifted

		}

		//
		// 59x buttons
		//
		if (dat[0] == 0x90) {
			const val = dat[2] == 0x7f
			if (dat[1] == 0x01) return {sync1But: val}
			if (dat[1] == 0x02) return {keylock1But: val}
			if (dat[1] == 0x03) return {pitchBendDec1But: val}
			if (dat[1] == 0x04) return {pitchBendInc1But: val}
			if (dat[1] == 0x05) return {preview1But: val}
			if (dat[1] == 0x06) return {fx11But: val}
			if (dat[1] == 0x07) return {active11But: val}
			if (dat[1] == 0x08) return {fx13But: val}
			if (dat[1] == 0x09) return {active13But: val}
			if (dat[1] == 0x0a) return {shift1But: val}
			if (dat[1] == 0x0b) return {fx12But: val}
			if (dat[1] == 0x0c) return {active12But: val}
			if (dat[1] == 0x0d) return {loop1But: val}
			if (dat[1] == 0x0e) return {fx1But: val}
			if (dat[1] == 0x0f) return {loopIn1But: val}
			if (dat[1] == 0x10) return {loopOut1But: val}
			if (dat[1] == 0x11) return {autoLoop1But: val}
			if (dat[1] == 0x12) return {loopActive1But: val}
			if (dat[1] == 0x13) return {load1But: val}
			if (dat[1] == 0x14) return {hi1But: val}
			if (dat[1] == 0x15) return {mid1But: val}
			if (dat[1] == 0x16) return {low1But: val}
			if (dat[1] == 0x17) return {cup1But: val}
			if (dat[1] == 0x18) return {cue1But: val}
			if (dat[1] == 0x19) return {play1But: val}
			if (dat[1] == 0x1a) return {search1But: val}
			if (dat[1] == 0x1b) return {scratch1But: val}
			if (dat[1] == 0x1c) return {dry1But: val}
			if (dat[1] == 0x1d) return {jog1But: val}

			if (dat[1] == 0x1e) return {traxBut: val}

			// 3 = shifted
			if (dat[1] == 0x1f) return {sync3But: val}
			if (dat[1] == 0x20) return {keylock3But: val}
			if (dat[1] == 0x21) return {pitchBendDec3But: val}
			if (dat[1] == 0x22) return {pitchBendInc3But: val}
			if (dat[1] == 0x23) return {preview3But: val}
			if (dat[1] == 0x24) return {fx31But: val}
			if (dat[1] == 0x25) return {active31But: val}
			if (dat[1] == 0x26) return {fx33But: val}
			if (dat[1] == 0x27) return {active33But: val}
			if (dat[1] == 0x28) return {shift3But: val}
			if (dat[1] == 0x29) return {fx32But: val}
			if (dat[1] == 0x2a) return {active32But: val}
			if (dat[1] == 0x2b) return {loop3But: val}
			if (dat[1] == 0x2c) return {fx3But: val}
			if (dat[1] == 0x2d) return {loopIn3But: val}
			if (dat[1] == 0x2e) return {loopOut3But: val}
			if (dat[1] == 0x2f) return {autoLoop3But: val}
			if (dat[1] == 0x30) return {loopActive3But: val}
			if (dat[1] == 0x31) return {load3But: val}
			if (dat[1] == 0x32) return {hi3But: val}
			if (dat[1] == 0x33) return {mid3But: val}
			if (dat[1] == 0x34) return {low3But: val}
			if (dat[1] == 0x35) return {cup3But: val}
			if (dat[1] == 0x36) return {cue3But: val}
			if (dat[1] == 0x37) return {play3But: val}
			if (dat[1] == 0x38) return {search3But: val}
			if (dat[1] == 0x39) return {scratch3But: val}
			if (dat[1] == 0x3a) return {dry3But: val}
			if (dat[1] == 0x3b) return {jog3But: val}

			if (dat[1] == 0x3d) return {sync2But: val}
			if (dat[1] == 0x3e) return {keylock2But: val}
			if (dat[1] == 0x3f) return {pitchBendDec2But: val}
			if (dat[1] == 0x40) return {pitchBendInc2But: val}
			if (dat[1] == 0x41) return {preview2But: val}
			if (dat[1] == 0x42) return {fx22But: val}
			if (dat[1] == 0x43) return {active22But: val}
			if (dat[1] == 0x44) return {loop2But: val}
			if (dat[1] == 0x45) return {fx2But: val}
			if (dat[1] == 0x46) return {shift2But: val}
			if (dat[1] == 0x47) return {fx21But: val}
			if (dat[1] == 0x48) return {active21But: val}
			if (dat[1] == 0x49) return {fx23But: val}
			if (dat[1] == 0x4a) return {active23But: val}
			if (dat[1] == 0x4b) return {loopIn2But: val}
			if (dat[1] == 0x4c) return {loopOut2But: val}
			if (dat[1] == 0x4d) return {autoLoop2But: val}
			if (dat[1] == 0x4e) return {loopActive2But: val}
			if (dat[1] == 0x4f) return {load2But: val}
			if (dat[1] == 0x50) return {hi2But: val}
			if (dat[1] == 0x51) return {mid2But: val}
			if (dat[1] == 0x52) return {low2But: val}
			if (dat[1] == 0x53) return {cup2But: val}
			if (dat[1] == 0x54) return {cue2But: val}
			if (dat[1] == 0x55) return {play2But: val}
			if (dat[1] == 0x56) return {search2But: val}
			if (dat[1] == 0x57) return {scratch2But: val}
			if (dat[1] == 0x58) return {dry2But: val}
			if (dat[1] == 0x59) return {jog2But: val}

			// 4 = shifted
			if (dat[1] == 0x5b) return {sync4But: val}
			if (dat[1] == 0x5c) return {keylock4But: val}
			if (dat[1] == 0x5d) return {pitchBendDec4But: val}
			if (dat[1] == 0x5e) return {pitchBendInc4But: val}
			if (dat[1] == 0x5f) return {preview4But: val}
			if (dat[1] == 0x60) return {fx42But: val}
			if (dat[1] == 0x61) return {active42But: val}
			if (dat[1] == 0x62) return {loop4But: val}
			if (dat[1] == 0x63) return {fx4But: val}
			if (dat[1] == 0x64) return {shift4But: val}
			if (dat[1] == 0x65) return {fx41But: val}
			if (dat[1] == 0x66) return {active41But: val}
			if (dat[1] == 0x67) return {fx43But: val}
			if (dat[1] == 0x68) return {active43But: val}
			if (dat[1] == 0x69) return {loopIn4But: val}
			if (dat[1] == 0x6a) return {loopOut4But: val}
			if (dat[1] == 0x6b) return {autoLoop4But: val}
			if (dat[1] == 0x6c) return {loopActive4But: val}
			if (dat[1] == 0x6d) return {load4But: val}
			if (dat[1] == 0x6e) return {hi4But: val}
			if (dat[1] == 0x6f) return {mid4But: val}
			if (dat[1] == 0x70) return {low4But: val}
			if (dat[1] == 0x71) return {cup4But: val}
			if (dat[1] == 0x72) return {cue4But: val}
			if (dat[1] == 0x73) return {play4But: val}
			if (dat[1] == 0x74) return {search4But: val}
			if (dat[1] == 0x75) return {scratch4But: val}
			if (dat[1] == 0x76) return {dry4But: val}
			if (dat[1] == 0x77) return {jog4But: val}
		}

		return {unknown: [dat[0].toString(16), dat[1].toString(16), dat[2].toString(16)] }
	}
}

djme2.LEDon = (led, mid) => {
	let but = djme2.leds[led]
	if (but > 0x7f) but -= 0x80
	mid.out?.send([0x90, but, 0x7f])
	djme2.leds[led] = but + 0x80
}
djme2.LEDoff = (led, mid) => {
	let but = djme2.leds[led]
	if (but > 0x7f) but -= 0x80
	mid.out?.send([0x90, but, 0x00])
	djme2.leds[led] = but
}
djme2.LEDtoggle = (led, mid) => {
	let but = djme2.leds[led]
	if (but > 0x7f) {
		djme2.LEDoff(led, mid)
	} else {
		djme2.LEDon(led, mid)
	}
}