let canvas;
let tilemap;
let player;
let ghosts = [];
let database;

function setup() {
	// Firebase
	var firebaseConfig = {
		apiKey: "AIzaSyAmxjDLZrtiWjQGkekCdTXKx5zCbLDJP28",
		authDomain: "machin-dev.firebaseapp.com",
		databaseURL: "https://machin-dev.firebaseio.com",
		projectId: "machin-dev",
		storageBucket: "machin-dev.appspot.com",
		messagingSenderId: "471389656934",
		appId: "1:471389656934:web:de807290048ad37fa91aa7",
		measurementId: "G-2LDMEXJL3N"
	};
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	firebase.analytics();
	database = firebase.database();

	// Canvas
	canvas = createCanvas(16 * TILESIZE, 12 * TILESIZE);
	canvas.parent('wrapper');
	textAlign(CENTER, CENTER);
	frameRate(15);
	// Map
	tilemap = new TileMap();
	// Player
	var name = (getURLParams().name == null) ? "Null" : getURLParams().name;
	player = new Player(name, width/2, height/2, createVector(0, 0), true, false, 0);
	// Canvas events
	canvas.mousePressed(mouseDown);
	canvas.mouseReleased(mouseUp);
	// Database events
	var ref = database.ref('mmo/players');
  	ref.on('value', gotData, errData);
}

function mouseDown() {
	player.startMoving();
}

function mouseUp() {
	player.stopMoving();
}

function draw() {
	background(0);
	// Move
	if (player.is_moving) {
		player.move(mouseX, mouseY);
	}
	// Display map
	tilemap.display();
	// Display player
	player.display();
	// Display ghosts
	for (var k = 0; k < ghosts.length; k++) {
		ghosts[k].display();
	}
}

function gotData(data) {
	ghosts = [];
	var records = data.val();
	var names = Object.keys(records);
	for (var k = 0; k < names.length; k++) {
		var name = names[k];
		if (name != player.name) {
			var x = records[name].x;
			var y = records[name].y;
			var dir = createVector(records[name].dir[0], records[name].dir[1]);
			var time = records[name].lastAction;
			var is_moving = records[name].isMoving;
			var anim_frame = records[name].animFrame;
			// 10 minute timeout
			var timeout = 10 * 60 * 1000;
			if (player.latestTime - time < timeout) {
				ghosts.push(new Player(name, x, y, dir, false, is_moving, anim_frame));
			}
		} else {
			player.latestTime = records[name].lastAction;
		}
	}
	//draw();
}

function errData(err) {

}