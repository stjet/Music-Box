//make sure import bug is fixed. when playing, low octaves do not play... why??? (Empty string passed to getElementById() ???)
//above probably fixed
//https://stackoverflow.com/questions/58029703/is-it-possible-to-convert-frequency-hertz-array-to-audiobuffer-using-javascript
function export_notes() {
  let file_contents = String(document.getElementById("tempo").value)+"|"+type+"|"+document.getElementById("gap").value+"|"+document.getElementById("split-beats-into").value+"\n";
  for (i = 0; i < notes.length; i++) {
    for (j = 0; j < document.getElementById("columns").value; j++) {
      if (document.getElementById(notes[i]+"-"+String(j)).classList.contains("selected")) {
        file_contents += "+";
      } else {
        file_contents += "-";
      }
    } 
    file_contents += "\n";
  }
  let file = new Blob([file_contents], {type: 'text/plain'});
  //create new A link that directs to bottom url in popup, I guess
  window.location.href = "data:application/octet-stream;base64,"+btoa(file_contents)
}

function type_change() {
  type = document.getElementById("type").value;
}

function toggle_click_sound() {
  let click_sound_element = document.getElementById("click-sound");
  if (click_sound_element.value == "Turn Click Sound On") {
    click_sound_element.value = "Turn Click Sound Off";
    click_sound = true;
  } else {
    click_sound_element.value = "Turn Click Sound On";
    click_sound = false;
  }
}

function toggle_loop() {
  let loop_ele = document.getElementById("loop");
  if (loop == false) {
    loop_ele.value = "Turn Loop Off";
    loop = true;
  } else {
    loop_ele.value = "Turn Loop On";
    loop = false;
  }
}

async function toggle_select(id) {
  if (document.getElementById(id).classList.contains("selected")) {
    document.getElementById(id).classList.remove("selected")
  } else {
    document.getElementById(id).classList.add("selected")
    if (click_sound == true) {
      let tempo = Number(document.getElementById("tempo").value);
      let oscillator = audioCtx.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequencies[notes.indexOf(document.getElementById(id).innerHTML)];
      oscillator.connect(audioCtx.destination);
      oscillator.start()
      let split_beats_into = Number(document.getElementById("split-beats-into").value);
      await sleep((60000/tempo)/split_beats_into);
      oscillator.stop()
    }
  }
}

function updateColumns(wipeout=false) {
  let requested_columns_num = Number(document.getElementById("columns").value);
  if (wipeout) {
    requested_columns_num = 0;
  } 
  let difference = Math.abs(column_number_previous-requested_columns_num);
  if (column_number_previous > requested_columns_num) {
    //this means current requested number of columns is less then previous, meaning there was a reduction
    let top = document.getElementById("top");
    for (i = requested_columns_num; i < column_number_previous; i++) {
      top.removeChild(document.getElementById("top-"+String(i)));
      for (j = 0; j < notes.length; j++) {
        let row = document.getElementById(String(j));
        row.removeChild(document.getElementById(notes[j]+"-"+String(i)));
      }
    }
  }
  else if (column_number_previous < requested_columns_num) {
    //this means current requested number of columns is more then previous, meaning there was a increased
    let top = document.getElementById("top");
    for (i = column_number_previous; i < requested_columns_num; i++) {
      let top_ele = document.createElement("DIV");
      top_ele.setAttribute("class","top");
      top_ele.setAttribute("id","top-"+String(i)); 
      top.appendChild(top_ele);
      for (j = 0; j < notes.length; j++) {
        note = document.createElement("DIV");
        note.setAttribute("id",notes[j]+"-"+String(i));
        note.setAttribute("class","note-item");
        if (i == 0) {
          note.classList.add("first-item");
        }
        if (j == notes.length-1) {
          note.classList.add("last-row-item");
        }
        note.innerHTML = notes[j];
        note.setAttribute("onclick","toggle_select(this.id)");
        document.getElementById(String(j)).appendChild(note);
      }
    }
  }

  column_number_previous = requested_columns_num;
  
  /*
  let columns_num = document.getElementById("columns").value;
  while (document.getElementById("top").firstChild) {
    document.getElementById("top").removeChild(document.getElementById("top").firstChild);
  }
  for (k = 0; k < columns_num; k++) {
    let top = document.createElement("DIV");
    top.setAttribute("class","top");
    top.setAttribute("id","top-"+String(k));
    document.getElementById("top").appendChild(top);
  }
  for (i = 0; i < 12; i++) {
    while (document.getElementById(String(i)).firstChild) {
      document.getElementById(String(i)).removeChild(document.getElementById(String(i)).firstChild);
    }
    for (j = 0; j < columns_num; j++) {
      note = document.createElement("DIV");
      note.setAttribute("id",notes[i]+"-"+String(j));
      note.setAttribute("class","note-item");
      if (j == 0) {
        note.classList.add("first-item");
      }
      if (i == 11) {
        note.classList.add("last-row-item");
      }
      note.innerHTML = notes[i];
      note.setAttribute("onclick","toggle_select(this.id)");
      document.getElementById(String(i)).appendChild(note);
    }
  }
  column_number_previous = columns_num;*/
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();

async function play_note() {
    let play_btn = document.getElementById("play");
    play_btn.value = "Pause";
    let tempo = Number(document.getElementById("tempo").value);
    //iterate through columns
    for (j = 0; j < document.getElementById("columns").value; j++) {
      document.getElementById("top-"+String(j)).classList.add("current");
      let to_play = [];
      for (i = 0; i < notes.length; i++) {
        let note = document.getElementById(notes[i]+"-"+String(j));
        if (note.classList.contains("selected")) {
          to_play.push(notes[i]);
        }
      }
      let to_play_audio = [];
      for (i = 0; i < to_play.length; i++) {
        let oscillator = audioCtx.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequencies[notes.indexOf(to_play[i])];
        oscillator.connect(audioCtx.destination);
      to_play_audio.push(oscillator);
      }
      let eval_string = "";
      for (i = 0; i < to_play_audio.length; i++) {
        eval_string += 'to_play_audio['+String(i)+'].start();';
      } 
      eval(eval_string);
      let split_beats_into = Number(document.getElementById("split-beats-into").value);
      await sleep((60000/tempo)/split_beats_into);
      let eval_string2 = "";
      for (i = 0; i < to_play_audio.length; i++) {
        eval_string2 += 'to_play_audio['+String(i)+'].stop();';
      } 
      eval(eval_string2); 
      if (Number(document.getElementById("gap").value) != 0) {
        await sleep(Number(document.getElementById("gap").value));
      }
      document.getElementById("top-"+String(j)).classList.remove("current");
      if (stop == true) {
        stop = false;
        break;
      }
    }
    if (loop) {
      play_note();
    }
    else {
      play_btn.value = "Play";
    }
}

function onclick_play() {
  let play_btn = document.getElementById("play");
  if (play_btn.value == "Play") {
    play_note()
  } else {
    stop = true;
  }
}

async function export_as_file() {
  //maybe use blob url https://stackoverflow.com/questions/60431835/how-to-convert-a-blob-url-to-a-audio-file-and-save-it-to-the-server
  //https://github.com/jackedgson/crunker
  function createOscillators(context, notes) {
    notes.reduce((offset, [ frequency, duration ]) => {
        const oscillatorNode = context.createOscillator();
        oscillatorNode.frequency.value = frequency;
        oscillatorNode.type = type;
        oscillatorNode.start();
        oscillatorNode.stop(duration);
        oscillatorNode.connect(context.destination);
        return duration;
    }, context.currentTime);
  }
  let tempo = Number(document.getElementById("tempo").value);
  let columns = document.getElementById("columns");
  let crunker = new Crunker();
  let buffers = [];
  let split_beats_into = Number(document.getElementById("split-beats-into").value);
  for (j = 0; j < columns.value; j++) {
    let column_notes = [];
    for (i = 0; i < notes.length; i++) {
      let note = document.getElementById(notes[i]+"-"+String(j));
      if (note.classList.contains("selected")) {
        column_notes.push([frequencies[notes.indexOf(notes[i])], (60/tempo)/split_beats_into]);
        console.log(frequencies[notes.indexOf(notes[i])])
      }
    }
    let length_seconds = (60/tempo)/split_beats_into;
    let sampleRate = 44100;
    const offlineAudioContext = new OfflineAudioContext({ length: length_seconds * sampleRate, sampleRate });
    createOscillators(offlineAudioContext, column_notes);
    let buffer = await offlineAudioContext.startRendering();
    buffers.push(buffer);
    console.log(buffer)
  }
  //combine
  console.log(buffers)
  let final_buffer = await crunker.concatAudio(buffers);
  let output = crunker.export(final_buffer, "audio/mp3");
  crunker.download(output.blob, "tune");
}

async function file_input() {
  let input_file = document.getElementById("file-input").files[0];
  input_file = await input_file.text()
  input_file = input_file.split("\n");
  document.getElementById("tempo").value = input_file[0].split("|")[0];
  type = input_file[0].split("|")[1];
  document.getElementById("type").value = input_file[0].split("|")[1];
  document.getElementById("gap").value = input_file[0].split("|")[2];
	let split_beats_into = input_file[0].split("|")[3];
	document.getElementById("split-beats-into").value = split_beats_into;
  input_file.shift();
  document.getElementById("columns").value = input_file[0].length;
  updateColumns(wipeout=true)
  updateColumns();
  for (i = 0; i < input_file.length; i++) {
    let row = input_file[i];
    let columns = row.length;
    for (j = 0; j < columns; j++) {
      let note = document.getElementById(notes[i]+"-"+String(j));
      if (row[j] == "-") {
        //do nothing!
      } else if (row[j] == "+") {
        note.classList.add("selected");
      }
    }
  }
}