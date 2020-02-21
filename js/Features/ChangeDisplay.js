// 	#############  CHANGEDISPLAY.JS  ###############
//	 		Authors : 	FERSULA Jérémy
// 	################################################
// 
// 	To help you dig into this code, the main parts
// 	in this file are indexed via comments.	
//
//		Ex:  [ 2.4 ] - Something
//
//	References to other parts of the app are linked
//	via indexes.
//
//		### indexes a section
//		--- indexes a sub-section
//
//	---
//
//	All relations between indexing in files can be
// 	found on our GitHub :
//
// 		https://github.com/huacayacauh/JS-Sandpile
//
// 	---
//
//  This file is under CC-BY.
//
//	Feel free to edit it as long as you provide 
// 	a link to its original source.
//
// 	################################################

// ################################################
//
// 	[ 1.0 ] 	GUI Functions
//
//		Used directly by Sandpiles.html
//
// ################################################
function changeIPS(val){
	it_per_frame = val.value;
}

function changeDelay(val){
	delay = val.value;
}

function changeSeed(val){
	Math.seedrandom(val.value);
}

function set_zoom(val){
	if(app){
		app.camera.zoom = val.value / 100;
		app.controls.zoomCamera();
		app.controls.object.updateProjectionMatrix();
	}
}

// Using JQuerry to prevent breaking the inputs
$(document).on('keyup', 'input', function () {
    var _this = $(this);
    var min = parseInt(_this.attr('min')) || 0; // if min attribute is not defined, 1 is default
	var max = parseInt(_this.attr('max')) || 999; // if max attribute is not defined, 100 is default
    var val = parseInt(_this.val()) || (min - 1); // if input char is not a number the value will be (min - 1) so first condition will be true
	if(val < min)
        _this.val( min );
    if(val > max)
        _this.val( max );
});


// ------------------------------------------------
// 	[ 1.1 ] 	Display various measures
//				of the current Tiling.
//
//		See Stats.js [ 1.0 ]
//
// ------------------------------------------------
function show_stats(){
	if(currentTiling){
		var infos = currentTiling.get_stats();
		var info_disp = document.getElementById("statsInfo");
		
		var text_stats = "Number of tiles : " + currentTiling.tiles.length + "<br>Mean : " + infos["Mean"] + "<br> Standard deviation : " + infos["Std"] + "<br> Population : <br>";
		var jump_line = false;
		Object.keys(infos["Population"]).forEach(function(key) {
				text_stats += " " + key + " : " + (Math.round(infos["Population"][key]*1000000)/10000).toFixed(2) + " %";
			if(jump_line)
				text_stats += "<br>";
			else
				text_stats += " - ";
			jump_line = !jump_line;
		});
		info_disp.innerHTML = text_stats ;
	}
}


// ################################################
//
// 	[ 2.0 ] 	Color picking window
//
//		See Tiling.js [ 2.0 ] and [ 2.6 ]
//		for the use of colormaps.
//
// ################################################

// Color selection modal
var modal = document.getElementById('colors');

// Button that opens the modal
var btn = document.getElementById("colorButton");

// When the user clicks on the button, open the modal 
btn.onclick = function() {
	
	// ------------------------------------------------
	// 	[ 2.1 ] 	Re-build the content of the
	//				modal every-time we open it
	// ------------------------------------------------
	while (modal.children[0].firstChild) {
		modal.children[0].removeChild(modal.children[0].firstChild);
	}
	var exitModal = document.createElement("span");
	exitModal.classList.add('close');
	exitModal.innerHTML = "&times;";
	exitModal.onclick = function() {
	  modal.style.display = "none";
	}
	
	
	modal.children[0].appendChild(exitModal);
	
	var colorInputs = []
	
	for(var i = 0; i<cmap.length; i++){
		var para = document.createElement("p");
		var node = document.createTextNode("Color " + i);
		
		var colElement = document.createElement("input");
		colElement.type = "color";
		colElement.style= "display:inline; margin-left:20px";
		colElement.value = "#" + cmap[i].getHexString();
		
		colorInputs.push(colElement);
		
		para.appendChild(node);
		para.appendChild(colElement);
		modal.children[0].appendChild(para);
	}
	
	// The modal is fully built, now we add buttons to add or remove colors
	
	var colorTotal = cmap.length;
	
	var addColor = document.createElement("button");
	addColor.innerHTML = "Add color";
	addColor.classList.add("btn");
	addColor.classList.add("btn-default");
	addColor.style = "bottom:20px;right:100px;position:absolute;";
	addColor.onclick = function() {
		var para = document.createElement("p");
		var node = document.createTextNode("Color " + colorTotal);
		colorTotal ++;
		var colElement = document.createElement("input");
		colElement.type = "color";
		colElement.style= "display:inline; margin-left:20px";
		colElement.value = colorInputs[colorInputs.length - 1].value;
		
		colorInputs.push(colElement);
		
		para.appendChild(node);
		para.appendChild(colElement);
		modal.children[0].appendChild(para);
	}
	
	var validate = document.createElement("button");
	validate.classList.add("btn");
	validate.classList.add("btn-default");
	validate.innerHTML = "Save";
	validate.style = "bottom:20px; right:20px;position:absolute;";
	validate.onclick = function() {
		var newCmap = [];
		for(var i = 0; i < colorInputs.length; i++){
			var col = new THREE.Color(0x000000);
			col.set(colorInputs[i].value);
			newCmap.push(col);
		}
		cmap = newCmap;
		if(currentTiling){
			currentTiling.cmap = newCmap;
			currentTiling.colorTiles();
		}
		modal.style.display = "none";
	}
	
	// ------------------------------------------------
	// 	[ 2.2 ] 	Manages presets
	//
	//		This section could be improved.
	// ------------------------------------------------
	
	var preset_span = document.createElement("span");
	preset_span.innerHTML = "Preset : ";
	var preset_choice = document.createElement("select");
	preset_span.style = "top:60px; right:20px;position:absolute;";
	preset_choice.style = "display:inline";
	preset_span.appendChild(preset_choice);
	preset_choice.oninput = function() {
		var grey_array = ["#ffffff", "#dddddd", "#bbbbbb", "#999999", "#777777", "#555555", "#eeee00"];
		var lava_array = ["#cccccc", "#888888", "#444444", "#553333", "#772222", "#aa1111", "#ff1100", "#ff8800", "#eeee00"];
		
		var blue_array = ["#000055", "#000088", "#0022aa", "#0044ff", "#0099ff", "#00ccff", "#00ffff", "#aaffff", "#ffffff"];
		
		var green_array = ["#ffffff", "#ffffcc", "#ddffaa", "#aaff77", "#66ff33", "#33cc33", "#009933"];
		
		var selected_array;
		
		switch(preset_choice.value){
			case "grey":
			selected_array = grey_array;
			break;
			
			case "lava":
			selected_array = lava_array;
			break;
			
			case "blue":
			selected_array = blue_array;
			break;
			
			case "green":
			selected_array = green_array;
			break;
		}
		
		for(var i = 0; i < selected_array.length; i++){
			if(colorInputs[i]){
				colorInputs[i].value = selected_array[i];
			} else {
				addColor.onclick();
				colorInputs[i].value = selected_array[i];
			}
		}
		if(selected_array.length < colorInputs.length){
			for(var i = selected_array.length; i < colorInputs.length; i++){
				colorInputs[i].parentNode.parentNode.removeChild(colorInputs[i].parentNode);
				colorTotal --;
			}
			
			colorInputs.splice(selected_array.length, colorInputs.length - selected_array.length);
		}
	}
	
	// Create element for each preset we defined
	
	var p1 = document.createElement("option");
	p1.value = "grey";
	p1.innerHTML = "Gold Dust";
	preset_choice.appendChild(p1);
	
	var p2 = document.createElement("option");
	p2.value = "lava";
	p2.innerHTML = "Lava red";
	preset_choice.appendChild(p2);
	
	var p3 = document.createElement("option");
	p3.value = "blue";
	p3.innerHTML = "Deep blue";
	preset_choice.appendChild(p3);
	
	var p4 = document.createElement("option");
	p4.value = "green";
	p4.innerHTML = "Lime green";
	preset_choice.appendChild(p4);
	
	
	// We append the controls created to the modal and display it on screen
	
	modal.children[0].appendChild(addColor);
	modal.children[0].appendChild(validate);
	modal.children[0].appendChild(preset_span);
    modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// ################################################
//
// 	[ 3.0 ] 	Misc display Functions
//
//		Used directly by Sandpiles.html
//
// ################################################

var paramshown = true;

function hideParams(){
	if(paramshown){
		document.getElementById("paramTitle").innerHTML ="Parameters ▼";
		paramshown = false;
		document.getElementById("paramHide").style="display:none";
	} else {
		
		document.getElementById("paramTitle").innerHTML ="Parameters ▲";
		paramshown = true;
		document.getElementById("paramHide").style="display:inherit";
	}
		
}

// Prevents wireFrameToggle from being automatcally set to true
$('input[id="wireFrameToggle"]').removeAttr('checked');


// ################################################
//
// 	EOF
//
// ################################################

