/********************************* 
JS Audio Knobs by Colin Bone Dodds
Touched by DrSnuggles
*********************************/

let madeGlobalEventHandlers = false; //checked during each Knob class instantiation. Only the first instantiation creates the event handlers.

let knobInUse = {
  id: "",
  initY: 0,
  currentKnob: {}
};

export class Knob {
  constructor({
    id = "knob1",
    lowVal = 0,
    highVal = 100,
    value = 0,
    size = "xlarge",
    sensitivity = 1,
    type = "LittlePhatty",
    label = true,
    lblTxtColor = "silver",
	valFunc = null,
  }) {
    this.id = id;
    this.lowVal = lowVal;
    this.highVal = highVal;
    if (value > highVal) {
      this.currentValue = highVal;
    } else if (value < lowVal) {
      this.currentValue = lowVal;
    } else {
      this.currentValue = value;
    }
    this.sensitivity = sensitivity;
    this.scaler = 100 / (this.highVal - this.lowVal); // with input midi even 7bit is more than 100. this should be removed and all should be 0..1
    this.type = type;
    this.label = label;
    this.lblTxtColor = lblTxtColor;
    if (size == "xlarge") {
      this.size = 128;
    } else if (size == "large") {
      this.size = 85;
    } else if (size == "medium") {
      this.size = 50;
    } else if (size == "small") {
      this.size = 40;
    } else {
      this.size = 30;
    }
    //set the image file. Format is e.g. "LittlePhatty/LittlePhatty_40.png";
    //this.imgFile = `${this.type}/${this.type}_${this.size}.webp`;
	this.imgFile = `${this.type}_${this.size}.webp`;
	this.valFunc = valFunc

    //run the initializer method
    this.setUpKnob();
  }

  setUpKnob() {
    let div = document.getElementById(this.id);
    //setup div contents
    let imgDiv = document.createElement("div");
    // let src = "./jsaudioknobs/knob_Images/" + this.imgFile;
    let src = "./img/" + this.imgFile;
    imgDiv.innerHTML = `<img draggable='false' style='pointer-events: none; transform: translateY(0px);' src=${src}>`;
    let lblDiv = document.createElement("div");
    div.appendChild(imgDiv);
    div.appendChild(lblDiv);
    //set the style
    imgDiv.style = `overflow: hidden; height: ${this.size}px; scale: 0.5; top: -32px; position:relative; user-select: none;`;
    div.style = "position: absolute;";

    //add an event listener
    imgDiv.addEventListener(
      "mousedown",
      function(e) {
        //set the knobInUse object
        knobInUse = {
          id: this.id,
          initY: e.pageY,
          value: this.currentValue, //storing the value
          currentKnob: this //storing the reference
        };
      }.bind(this) //we must bind 'this' to the event listener (or use 'let that = this', then set values to 'that')
    );

    //as above for touch event
    imgDiv.addEventListener(
      "touchstart",
      function(e) {
        //set the knobInUse object
        knobInUse = {
          id: this.id,
          initY: e.targetTouches[0].pageY,
          value: this.currentValue, //storing the value
          currentKnob: this //storing the reference
        };
      }.bind(this) //we must bind 'this' to the event listener (or use 'let that = this', then set values to 'that')
    , {passive: true});

    //do we need to make the global event handlers? - they only get made on the first knob instantiation
    if (madeGlobalEventHandlers == false) {
      createGlobalEventHandlers();
      madeGlobalEventHandlers = true;
    }

    //set the style for the label
	lblDiv.className = 'knobValue'
    lblDiv.style.color = this.lblTxtColor

    //set the image position
    this.setImage();
  }

  setValue(val) {
    //check the new value is within the acceptable range
    if (val > this.highVal) {
      this.currentValue = this.highVal
      console.log(`you tried to set a value of ${val} which exceeded the upper limit of ${this.highVal}`)
    } else if (val < this.lowVal) {
      this.currentValue = this.lowVal
      console.log(`you tried to set a value of ${val} which exceeded the lower limit of ${this.lowVal}`)
    } else {
      this.currentValue = val
    }
    //set the image
    this.setImage()
    //call the users function
	// NO! I update the knob on midi if now setValue fires knobChanged we are in an endless loop
	/*
    if (typeof knobChanged == "function") {
      knobChanged(this.id, this.currentValue)
    }
	*/
  }

  setImage() {
    //change the image position to match
    let sum = getSum(this)
    document.getElementById( this.id).childNodes[0].childNodes[0].style.transform = `translateY(-${sum}px)`
	updateLabel(this)
  }

  getValue() {
	return this.currentValue
  }
} //end of class definition

function createGlobalEventHandlers() {
  //also add the global style here (needed for the onmousemove > e.pageY call to work correctly)
  document
    .querySelectorAll("html, body")
    .forEach(node => (node.style.height = "100%"));

  //mouseup global event handler > resets the knobinuse object to show no knob in use
  document.body.addEventListener("mouseup", function(e) {
    //reset the knobInUse object
    resetKnobInUse(e);
  });

  //as above for touchend event
  document.body.addEventListener("touchend", function(e) {
    //reset the knobInUse object
    resetKnobInUse(e);
  });

  function resetKnobInUse() {
    //set the knobInUse object
    knobInUse = {
      id: "",
      initY: 0,
      value: 0,
      currentKnob: null
    };
  }

  //mousemove + touchmove global event handler > does the bulk of the work
  document.body.addEventListener("mousemove", bulkWork)
  document.body.addEventListener("touchmove", bulkWork)
  
	function bulkWork(e) {
		if (knobInUse.id != "") {
		//console.log(e.pageY); //for testing
		//freeze mouse drag activity if user hits top or bottom of the page
		let pageY = e.targetTouches?.[0].pageY ? e.targetTouches[0].pageY : e.pageY
		if (pageY <= 10 || pageY >= document.body.clientHeight - 10) {
			knobInUse = { id: "", initY: 0, currentKnob: null } // todo: that causes the out of bounds window problem
			return
		} else {
			//calculate new knob value
			knobInUse.currentKnob.currentValue = Math.round(
			knobInUse.value +
				((knobInUse.initY - pageY) *
				knobInUse.currentKnob.sensitivity) /
				knobInUse.currentKnob.scaler
			)
			//use max/min variables for easier reading
			let max = knobInUse.currentKnob.highVal,
			min = knobInUse.currentKnob.lowVal

			//ensure the know value does not exceed max and/or minimum values
			if (knobInUse.currentKnob.currentValue > max) {
				knobInUse.currentKnob.currentValue = max
			} else if (knobInUse.currentKnob.currentValue < min) {
				knobInUse.currentKnob.currentValue = min
			}
		}

		//update label (if user wants labels)
		updateLabel(knobInUse.currentKnob)

		//change the image position to match
		let sum = getSum(knobInUse.currentKnob)
		let newY = `translateY(-${sum}px)`
		//access to the image goes: container div > image wrapper div > image tag
		document.getElementById(knobInUse.id).childNodes[0].childNodes[0].style.transform = newY

    	//the knob change function call that users can hook into
    	if (typeof knobChanged == "function") {
        	//knobChanged(knobInUse.id, knobInUse.currentKnob.currentValue);
			knobChanged(knobInUse.id, (knobInUse.currentKnob.currentValue - knobInUse.currentKnob.lowVal) / (knobInUse.currentKnob.highVal - knobInUse.currentKnob.lowVal))
    	}
    }
  }
}

function updateLabel(knob) {
	let val = (typeof knob.valFunc === 'function') ? knob.valFunc(knob.currentValue) : knob.currentValue.toFixed(1)
	if (knob.label != false) {
		document.getElementById(knob.id).childNodes[1].innerHTML = val
	}
}
function getSum(knob) {
	return (Math.floor(
		((knob.currentValue - knob.lowVal) *
		knob.scaler) /
		  2
	  ) -
		0) * knob.size // was -1 before and i think it didn't match
}
