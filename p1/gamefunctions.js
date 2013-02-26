//
// Game Functions
//
// Shrikant Savant
//
//-------------------------------------------------------------

    // Define global variables
    var WinWidth, WinHeight;
    var Game = new Object;
    Game.NumObstacles = 6;
    Game.NumXSections = 3;

    // Game levels
    Game.NumLevels = 3;
    Game.Level = 0; // 0 to 2
    Game.NumBalls = 5;
    Game.BallNumber = 0; // 0 to 4
    Game.NumWoods = [4, 5, 6];
    Game.NumFires = [3, 4, 5];
    Game.NumGolds = [1, 2, 3];
    Game.Score = 0;
    Game.SavedScore = 0;
    Game.HighScore = 0;
    Game.HighScoreThreshold = 160; // Threshold for high score
    Game.Ended = true;

    // Board layout related variables
    var BallDiaPct = 4;
    var BoardTopPct = 5;
    var GoldDiaPct = 20;
    var GoalDiaPct = 20;
    var BoardCols = [[0,20],[25,45],[55,75],[80,100]];
    var BoardRows = [[5,25],[30,50],[55,75],[80,100]];
    var Filled = new Array(Game.NumLevels);
    for (var l=0; l < Game.NumLevels; l++) {
        Filled[l] = new Array(4);
        for (var i=0; i < 4; i++) {
            Filled[l][i] = new Array(4);
        }
    }

    //-------------------------------------------------------------
    function BackToMainPage() {
        window.location.href = 'main.html';
    }

    //-------------------------------------------------------------
    function StartUp() {

        // Initialize the game
        InitializeGame();

        // Draw the game
        DrawGame();
    }

    //-------------------------------------------------------------
    function DrawGame() {

        // Setup the game board
        DrawGameBoard();

        // Reset important variables
        Game.StartTime = new Date();
        Game.TimeDiffSaved = 0;
        Game.Ended = false;
        Game.Level = 0;
        Game.BallNumber = 0;
        Game.Score = 0;

    }

    //-------------------------------------------------------------
    function AddEventListeners() {

        window.addEventListener("touchstart", PlaySound, false);

        // Orientation events
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', HandleOrientation, false);
        } else {
            message3("Device orientation not supported on this device")
        }

    }

    //-------------------------------------------------------------
    function RemoveEventListeners() {

        // Remove all the listeners
        window.removeEventListener("touchstart", PlaySound);
        window.addEventListener("touchstart", function() {}); // Do nothing

        // Orientation events
        if (window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientation', HandleOrientation);
        }

    }

    //-------------------------------------------------------------
    function InitializeGame() {

        // Get window size
        WinWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        WinHeight = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

        // Board
        var divBoard = document.getElementById('divBoard');
        divBoard.style.width = WinWidth+'px';
        divBoard.style.height = Math.round(WinHeight*(1-BoardTopPct/100))+'px';
        divBoard.style.top = Math.round(WinHeight*BoardTopPct/100)+'px';
        Game.Board = new Rectangle(divBoard.offsetTop, divBoard.offsetLeft,
            divBoard.clientWidth, divBoard.clientHeight);

        // Ball
        var divBall = document.getElementById('divBall');
        divBall.style.width = Math.round(WinHeight*BallDiaPct/100)+'px';
        divBall.style.height = divBall.style.width;
        divBall.style.borderRadius = Math.round(WinHeight*BallDiaPct/100/2)+'px';
        Game.Ball = new Rectangle(divBall.offsetTop, divBall.offsetLeft,
            divBall.clientWidth, divBall.clientHeight);
        Game.Ball.Dia = divBall.clientWidth;
        divBall.style.display = "none";

        // Goal
        var divGoal = document.getElementById('divGoal');
        divGoal.style.width = Math.round(WinHeight*GoalDiaPct/100)+'px';
        divGoal.style.height = divGoal.style.width;
        divGoal.style.borderRadius = Math.round(WinHeight*GoalDiaPct/100/2)+'px';
        Game.Goal = new Rectangle(divGoal.offsetTop, divGoal.offsetLeft,
            divGoal.clientWidth, divGoal.clientHeight);
        Game.Goal.Dia = divGoal.clientWidth;
        divGoal.style.display = "none";

        // Obstacles
        Game.Obstacles = new Array(Game.NumObstacles);

        // Wood, fire and gold obstacles
        Game.Wood = new Array(Game.NumLevels);
        Game.Fire = new Array(Game.NumLevels);
        Game.Gold = new Array(Game.NumLevels);
        for (var l = 0; l < Game.NumLevels; l++) {
            Game.Wood[l] = new Array(Game.NumWoods[l]);
            Game.Fire[l] = new Array(Game.NumFires[l]);
            Game.Gold[l] = new Array(Game.NumGolds[l]);
        }

        // Reset the Filled array
        for (var l=0; l < Game.NumLevels; l++) {
            for (var i=0; i < 4; i++) {
                for (var j=0; j < 4; j++) {
                    Filled[l][i][j]=0;
                }
            }
        }

        // Baseline roll and pitch angles for calibrating
        Game.Roll0 = 0;
        Game.Pitch0 = 0;

        // Setup DxMax and DyMax - same as ball dia
        Game.DxMax = Game.Ball.Dia;
        Game.DyMax = Game.Ball.Dia;

        // Setup Menu
        SetupMenu();
    }

    // User name
    //-------------------------------------------------------------
    function SetUserName() {
        // Read the user name
        var userName = document.getElementById('inputUserName');
        var temp = userName.value.toString();
        //temp.replace(/(^\s+|\s+$)/g,'');
        temp.replace(/(^\s+|\s+$)/g," ");
        Game.UserName = temp;

        // Hide the user name input box
        var divUserName = document.getElementById('divUserName');
        divUserName.style.display = "none";

        var name = "Stranger";
        if (Game.UserName.length != 0) {
            name = Game.UserName;
        }

        // Show the welcome message
        var divMessage1 = document.getElementById('divMessage1');
        divMessage1.innerHTML = 'Welcome '+name;
        divMessage1.style.display = "inline"
    }

    // Geolocation
    //-------------------------------------------------------------
    function SetUserLocation() {
        var divMessage1 = document.getElementById('divMessage1');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(StorePosition);
        }
        else {
            divMessage1.innerHTML="Geolocation is not supported by this browser.";
        }
    }

    //-------------------------------------------------------------
    function StorePosition(position) {
        Game.latitude = position.coords.latitude;
        Game.longitude = position.coords.longitude;
    }

    // Setup Menu
    //-------------------------------------------------------------
    function SetupMenu() {
        var x0=0.0, x1=0.25, x2=0.35, x3=0.5, x4=0.6, x5=0.7, x6=0.8, x7=0.9, x8=1.0;
        var menuHeight = Math.round(WinHeight*BoardTopPct/100);

        // User name
        var divUserName = document.getElementById('divUserName');
        divUserName.style.top = '0px';
        divUserName.style.left = '5px';
        var inputWidth = Math.round(WinWidth*(x1-x0));
        divUserName.style.width = inputWidth+'px';
        divUserName.style.height = menuHeight+'px';
        var inputUserName = document.getElementById('inputUserName');
        inputUserName.style.width = Math.round(inputWidth/2.5)+'px';
        inputUserName.style.height = menuHeight+'px';

        // Message 1
        var divMessage1 = document.getElementById('divMessage1');
        divMessage1.style.top = '0px';
        divMessage1.style.left = '5px';
        divMessage1.style.width = Math.round(WinWidth * (x1- x0)) + 'px';
        divMessage1.style.height = menuHeight + 'px';
        divMessage1.style.display = "none"; // Hide the message first

        // Start
        var divStart = document.getElementById('divStart');
        divStart.style.top = '0px';
        divStart.style.left = Math.round(WinWidth*x1)+'px';
        divStart.style.width = Math.round(WinWidth*(x2-x1))+'px';
        divStart.style.height = menuHeight+'px';

        // Message 2
        var divMessage2 = document.getElementById('divMessage2');
        divMessage2.style.top = '0px';
        divMessage2.style.left = Math.round(WinWidth*x2)+'px';
        divMessage2.style.width = Math.round(WinWidth*(x3-x2))+'px';
        divMessage2.style.height = menuHeight+'px';
        divMessage2.innerHTML = 'Ball 1 of 5';

        // High Scores - show only if the threshold is exceeded
        var divHighScores = document.getElementById('divHighScores');
        divHighScores.style.top = '0px';
        divHighScores.style.left = Math.round(WinWidth*x3)+'px';
        divHighScores.style.width = Math.round(WinWidth*(x4-x3))+'px';
        divHighScores.style.height = menuHeight+'px';
        if (localStorage.HighScore >= Game.HighScoreThreshold) {
            divHighScores.style.display = "inline";
        }
        else {
            divHighScores.style.display = "none";
        }

        // Recalibrate
        var divRecalibrate = document.getElementById('divRecalibrate');
        divRecalibrate.style.top = '0px';
        divRecalibrate.style.left = Math.round(WinWidth*x4)+'px';
        divRecalibrate.style.width = Math.round(WinWidth*(x5-x4))+'px';
        divRecalibrate.style.height = menuHeight+'px';

        // Pause
        var divPause = document.getElementById('divPause');
        divPause.style.top = '0px';
        divPause.style.left = Math.round(WinWidth*x5)+'px';
        divPause.style.width = Math.round(WinWidth*(x6-x5))+'px';
        divPause.style.height = menuHeight+'px';

        // Resume
        var divResume = document.getElementById('divResume');
        divResume.style.top = '0px';
        divResume.style.left = Math.round(WinWidth*x5)+'px';
        divResume.style.width = Math.round(WinWidth*(x6-x5))+'px';
        divResume.style.height = menuHeight+'px';
        divResume.style.display = "none"; // Hide the resume button first

        // Time
        var divTime = document.getElementById('divTime');
        divTime.style.top = '0px';
        divTime.style.left = Math.round(WinWidth*x6)+'px';
        divTime.style.width = Math.round(WinWidth*(x7-x6))+'px';
        divTime.style.height = menuHeight+'px';

        // Score
        var divScore = document.getElementById('divScore');
        divScore.style.top = '0px';
        divScore.style.left = Math.round(WinWidth*x7)+'px';
        divScore.style.width = Math.round(WinWidth*(x8-x7))+'px';
        divScore.style.height = menuHeight+'px';
    }

    //-------------------------------------------------------------
    function DrawGameBoard() {

        // Setup Menu
        //SetupMenu();

        // Loop through each level
        for (var l = 0; l < Game.NumLevels; l++) {

            var rRow, rCol;

            // Wood obstacles
            for (var i = 0; i < Game.NumWoods[l]; i++) {

                // Loop until an empty spot is found on the board
                while (1) {
                    rRow = GetRandom(0,3);
                    rCol = GetRandom(0,3);
                    if (Filled[l][rRow][rCol] == 0)
                        break;
                }

                // Empty spot found
                Game.Wood[l][i] = new Object();
                var xmin = Math.round(BoardCols[rCol][0]*WinWidth/100);
                var xmax = Math.round(BoardCols[rCol][1]*WinWidth/100);
                var ymin = Math.round(BoardRows[rRow][0]*WinHeight/100);
                var ymax = Math.round(BoardRows[rRow][1]*WinHeight/100);
                var wmin = Game.Ball.Dia;
                var wmax = xmax-xmin; //2*wmin; // or xmax-xmin
                var hmin = 2*Game.Ball.Dia;
                var hmax = ymax-ymin;

                var woodObj = new Object();
                PlaceObstacle(woodObj, xmin, xmax, ymin, ymax, wmin, wmax, hmin, hmax);
                Game.Wood[l][i] = woodObj;
                Filled[l][rRow][rCol]=1;
            }

            // Fire obstacles
            for (var i = 0; i < Game.NumFires[l]; i++) {

                // Loop until an empty spot is found on the board
                while(1) {
                    rRow = GetRandom(0,3);
                    rCol = GetRandom(0,3);
                    if (Filled[l][rRow][rCol] == 0)
                        break;
                }

                // Empty spot found
                Game.Fire[l][i] = new Object();
                var xmin = Math.round(BoardCols[rCol][0]*WinWidth/100);
                var xmax = Math.round(BoardCols[rCol][1]*WinWidth/100);
                var ymin = Math.round(BoardRows[rRow][0]*WinHeight/100);
                var ymax = Math.round(BoardRows[rRow][1]*WinHeight/100);
                var wmin = Game.Ball.Dia;
                var wmax = xmax-xmin; //2*wmin; // or xmax-xmin
                var hmin = 2*Game.Ball.Dia;
                var hmax = ymax-ymin;


                var fireObj = new Object();
                PlaceObstacle(fireObj, xmin, xmax, ymin, ymax, wmin, wmax, hmin, hmax);
                Game.Fire[l][i] = fireObj;
                Filled[l][rRow][rCol]=1;
            }

            // Gold obstacles
            for (var i = 0; i < Game.NumGolds[l]; i++) {

                // Loop until an empty spot is found on the board
                while(1) {
                    rRow = GetRandom(0,3);
                    rCol = GetRandom(0,3);
                    if (Filled[l][rRow][rCol] == 0)
                        break;
                }

                // Empty spot found
                Game.Gold[l][i] = new Object();
                var xmin = Math.round(BoardCols[rCol][0]*WinWidth/100);
                var xmax = Math.round(BoardCols[rCol][1]*WinWidth/100);
                var ymin = Math.round(BoardRows[rRow][0]*WinHeight/100);
                var ymax = Math.round(BoardRows[rRow][1]*WinHeight/100);
                var wmin = Game.Ball.Dia;
                var wmax = xmax-xmin; //2*wmin; // or xmax-xmin
                var hmin = 2*Game.Ball.Dia;
                var hmax = ymax-ymin;
                var goldObj = new Object();
                PlaceObstacle(goldObj, xmin, xmax, ymin, ymax, wmin, wmax, hmin, hmax);

                Game.Gold[l][i] = goldObj;
                Filled[l][rRow][rCol]=1;
            }
        }
    }

    // Start a new game
    //-------------------------------------------------------------
    function StartNewGame() {

        // If the game has ended reset the game and the board
        if (Game.Ended) {
            DrawGame();
        }

        AddEventListeners();
        SetUserName();

        // Hide the message popup
        var divMessage = document.getElementById('divMessage');
        divMessage.style.display = 'none';

        //
        // Draw the obstacles based on the current game level
        //
        // Get the current level
        var level = Game.Level;
        if (level >= Game.NumLevels)
            return;

        // Create the divs for the wood obstacles
        var woodStr = "";
        for (var i = 0; i < Game.NumWoods[level]; i++) {
            // Divs for the wood obstacles
            var woodid = 'wood_'+ i.toString();
            woodStr += "<div class='divObsWood' id='"+woodid+"'></div><br>"
        }
        document.getElementById('divWoodObstacles').innerHTML = woodStr;

        var wooddivarray = document.getElementsByClassName('divObsWood');

        // Draw the wood obstacles based on the current level
        for (var i = 0; i < Game.NumWoods[level]; i++) {

            wooddivarray[i].style.left   = Game.Wood[level][i].Left+'px';
            wooddivarray[i].style.top    = Game.Wood[level][i].Top+'px';
            wooddivarray[i].style.width  = Game.Wood[level][i].Width+'px';
            wooddivarray[i].style.height = Game.Wood[level][i].Height+'px';
        }

        // Create the divs for the fire obstacles
        var fireStr = "";
        for (var i = 0; i < Game.NumFires[level]; i++) {
            // Divs for the fire obstacles
            var fireid = 'fire_'+ i.toString();
            fireStr += "<div class='divObsFire' id='"+fireid+"'></div><br>"
        }
        document.getElementById('divFireObstacles').innerHTML = fireStr;

        var firedivarray = document.getElementsByClassName('divObsFire');

        // Draw the fire obstacles based on the current level
        for (var i = 0; i < Game.NumFires[level]; i++) {

            firedivarray[i].style.left   = Game.Fire[level][i].Left+'px';
            firedivarray[i].style.top    = Game.Fire[level][i].Top+'px';
            firedivarray[i].style.width  = Game.Fire[level][i].Width+'px';
            firedivarray[i].style.height = Game.Fire[level][i].Height+'px';
        }

        // Create the divs for the gold obstacles
        var goldStr = "";
        for (var i = 0; i < Game.NumGolds[level]; i++) {
            // Divs for the gold obstacles
            var goldid = 'gold_'+ i.toString();
            goldStr += "<div class='divObsGold' id='"+goldid+"'></div><br>"
        }
        document.getElementById('divGoldObstacles').innerHTML = goldStr;

        var golddivarray = document.getElementsByClassName('divObsGold');

        // Draw the gold obstacles based on the current level
        for (var i = 0; i < Game.NumGolds[level]; i++) {
            golddivarray[i].style.left   = Game.Gold[level][i].Left+'px';
            golddivarray[i].style.top    = Game.Gold[level][i].Top+'px';
            golddivarray[i].style.width =  Game.Gold[level][i].Width+'px'; // Math.round(WinHeight*GoldDiaPct/100)+'px';
            golddivarray[i].style.height = Game.Gold[level][i].Height+'px';
        }

        // Position the ball
        // Loop until an empty spot is found on the board for the ball
        var rColBall, rRowBall;
        while (1) {
            rColBall = GetRandom(0,3);
            rRowBall = GetRandom(0,3);
            if (Filled[level][rRowBall][rColBall] == 0)
                break;
        }

        // Position of the ball
        var xmin = Math.round(BoardCols[rColBall][0]*WinWidth/100);
        var xmax = Math.round(BoardCols[rColBall][1]*WinWidth/100);
        var ymin = Math.round(BoardRows[rRowBall][0]*WinHeight/100);
        var ymax = Math.round(BoardRows[rRowBall][1]*WinHeight/100);

        var xReset = GetRandom(xmin, xmax);
        var yReset = GetRandom(ymin, ymax);

        divBall.style.left = xReset+'px';
        divBall.style.top = yReset+'px';
        divBall.style.display = "inline";

        // Update the Game.Ball object
        Game.Ball.Left = xReset;
        Game.Ball.Top = yReset;

        // Position the goal
        // Loop until an empty spot is found on the board
        var rColGoal, rRowGoal;
        while (1) {
            rColGoal = GetRandom(0,3);
            rRowGoal = GetRandom(0,3);
            if ((Filled[level][rRowGoal][rColGoal] == 0) &&
                !((rRowGoal == rRowBall) && (rColGoal == rColBall))){
                break;
            }
        }

        // Position of the goal
        var xmin = Math.round(BoardCols[rColGoal][0]*WinWidth/100);
        var xmax = Math.round(BoardCols[rColGoal][1]*WinWidth/100);
        var ymin = Math.round(BoardRows[rRowGoal][0]*WinHeight/100);
        var ymax = Math.round(BoardRows[rRowGoal][1]*WinHeight/100);

        var xReset = GetRandom(xmin, xmax-Game.Goal.Width);
        var yReset = GetRandom(ymin, ymax-Game.Goal.Height);

        divGoal.style.left = xReset+'px';
        divGoal.style.top = yReset+'px';
        divGoal.style.display = "inline";

        // Update the Game.Ball object
        Game.Goal.Left = xReset;
        Game.Goal.Top = yReset;

        // Show the remaining number of balls
        var divMessage2 = document.getElementById('divMessage2');
        divMessage2.innerHTML = 'Level ' + (level+1) + ' - Ball ' + (Game.BallNumber+1) + ' of ' + Game.NumBalls;

        // Update the score
        var divScore = document.getElementById('divScore');
        divScore.innerHTML = 'Score ' + Game.Score;
    }

    // End the game
    //-------------------------------------------------------------
    function EndGame() {

        // If user is registered, store the user data in localStorage
        if (Game.Score > Game.HighScore) {
            Game.HighScore = Game.Score;
        }
        localStorage.HighScore = Game.HighScore;
        SetUserLocation();


        // Check if high score threshold is crossed, and save the information accordingly
        if (Game.Score > Game.HighScoreThreshold) {
            // Store the game statistics
            var storageObj = new Object();
            if (Game.UserName) {
                storageObj.UserName = Game.UserName;
            }
            else {
                storageObj.UserName = "Anonymous";
            }
            storageObj.GameTime = Game.TimeStr;
            storageObj.HighScore = Game.Score;

            // Append the storage data
            if (!localStorage.index) {
                localStorage.index = 0;
            }
            localStorage.setObj(localStorage.index, storageObj);
            localStorage.index++;
        }

        // Save the score first locally - socket is called asynchronously
        Game.SavedScore = Game.Score;

        // Submit user's scores
        //var socket = new WebSocket('ws://e76.technologeeks.com/asn1/scores.php');
        Game.Socket = new WebSocket("ws://echo.websocket.org/");
        Game.Socket.onopen = function(evt) { wsOnOpen(evt) };
        Game.Socket.onclose = function(evt) { wsOnClose(evt) };
        Game.Socket.onmessage = function(evt) { wsOnMessage(evt) };
        Game.Socket.onerror = function(evt) { wsOnError(evt) };

        // Hide the ball
        divBall.style.display = "none";
        divGoal.style.display = "none";

        // Reset the level and the ball number
        Game.Level = 0;
        Game.BallNumber = 0;
        Game.Score = 0;

        // Show the Pause button
        ShowPauseButton();

        // Remove all the listeners
        RemoveEventListeners()

        // Display the message
        var divMessage2 = document.getElementById('divMessage2');
        divMessage2.innerHTML = 'Game Over';

        // Reset the Filled array
        for (var l=0; l < Game.NumLevels; l++) {
            for (var i=0; i < 4; i++) {
                for (var j=0; j < 4; j++) {
                    Filled[l][i][j]=0;
                }
            }
        }

        // Baseline roll and pitch angles for calibrating
        Game.Roll0 = 0;
        Game.Pitch0 = 0;

        // Mark that the game has ended
        Game.Ended = true;
    }

    // Event handler
    //-------------------------------------------------------------
    function HandleOrientation(event) {

        // Initialize local variables
        var level    = Game.Level;
        if (level >= Game.NumLevels)
            return;

        // Refresh the time
        Game.EndTime = new Date();
        var timeDiff = (Game.EndTime - Game.StartTime)/1000 + Game.TimeDiffSaved;
        var minutes = Math.round((timeDiff/60)-0.5);
        var seconds = Math.round(timeDiff % 60);
        var divTime = document.getElementById('divTime');
        Game.TimeStr = minutes + ':'+ (seconds <= 9 ? '0'+seconds:seconds);
        divTime.innerHTML = 'Time  ' + Game.TimeStr;

        var xCurrent = Game.Ball.Left;
        var yCurrent = Game.Ball.Top;
        var dia = Game.Ball.Dia;
        var divBall = document.getElementById('divBall');
        var divGoal = document.getElementById('divGoal');

        // Read the orientation angles
        var roll = (-event.gamma)-Game.Roll0; // -90 to +90
        var pitch = (event.beta)-Game.Pitch0; // -180 to +180

        // Store the orientation angles for later use
        Game.Roll = roll;
        Game.Pitch = pitch;

        // Compute the new position
        var xplier = 2;
        var dx = pitch*xplier;
        var dy = roll*xplier;
        if (dx > Game.DxMax) dx = Game.DxMax;
        if (dy > Game.DyMax) dy = Game.DyMax;
        var xNew = xCurrent + Math.round(dx);
        var yNew = yCurrent + Math.round(dy);

        // Check if the new position is inside the board and make adjustments if necessary
        var collision1 = CheckCollisionInside(xNew, yNew, Game.Board.Left, Game.Board.Top, Game.Board.Width-dia, Game.Board.Height-dia);
        xNew = collision1.x;
        yNew = collision1.y;

        // Check for collisions with fire
        for (var i = 0; i < Game.NumFires[level]; i++) {
            var fireCollision = CheckCollisionOutside(xNew, yNew, xCurrent, yCurrent,
                Game.Fire[level][i].Left-dia, Game.Fire[level][i].Top-dia,
                Game.Fire[level][i].Width+dia, Game.Fire[level][i].Height+dia);

            if (fireCollision.collision) {
                // Increment the ball number
                Game.BallNumber++;

                // If the max number of balls is reached, end the game
                if (Game.BallNumber >= Game.NumBalls) {
                    EndGame();
                    return;
                }
                else {
                    // Start a new game
                    StartNewGame();
                    return;
                }
            }
        }

        // Check for collisions with gold
        var divScore = document.getElementById('divScore');
        for (var i = 0; i < Game.NumGolds[level]; i++) {
            var goldCollision = CheckCollisionOutside(xNew, yNew, xCurrent, yCurrent,
                Game.Gold[level][i].Left-dia, Game.Gold[level][i].Top-dia,
                Game.Gold[level][i].Width+dia, Game.Gold[level][i].Height+dia);

            if (goldCollision.collision) {
                var divGold = document.getElementById('gold_'+i);
                var hiddenStyle = divGold.style.display;
                if (hiddenStyle != "none") {
                    // Increment the score
                    Game.Score += 10;
                    divScore.innerHTML = 'Score ' + Game.Score;

                    // Hide the gold and continue the game
                    divGold.style.display = "none";
                }
            }
        }

        // Check if the goal is reached
        var goalReached = IsInside(xNew, yNew, Game.Goal.Left, Game.Goal.Top, Game.Goal.Width, Game.Goal.Height);
        if (goalReached) {
            Game.Score += 50;
            divScore.innerHTML = 'Score ' + Game.Score;

            // Increase the level and start a new game
            if (Game.Level < Game.NumLevels) {
                Game.Level++;
            }

            if (Game.Level >= Game.NumLevels) {
                EndGame();
                return;
            }
            else {
                StartNewGame();
                return;
            }
        }

        // Check for collisions with any of the obstacles
        var collision = false;
        var collisionData = new Array();
        var numCollisions = 0, idxCollision = 0;
        for (var i = 0; i < Game.NumWoods[level]; i++) {
            collisionData[i] = CheckCollisionOutside(xNew, yNew, xCurrent, yCurrent,
                Game.Wood[level][i].Left-dia, Game.Wood[level][i].Top-dia,
                Game.Wood[level][i].Width+dia, Game.Wood[level][i].Height+dia);

            if (collisionData[i].collision) {
                numCollisions = numCollisions+1;
                idxCollision = i;
            }
        }

        var drawBall = false;
        if (numCollisions == 0) {
            drawBall = true;
        }
        else if (numCollisions == 1) {
            var drawBall = true;
            var xNew = collisionData[idxCollision].x;
            var yNew = collisionData[idxCollision].y;
        }

        if (drawBall) {
            divBall.style.left = xNew+'px';
            divBall.style.top = yNew+'px';

            // Update the Game.Ball object
            Game.Ball.Left = xNew;
            Game.Ball.Top = yNew;
        }
    }


    function PlaySound() {
        document.getElementById('audiotag1').play();
    }
    //-------------------------------------------------------------
    // Utility functions
    //-------------------------------------------------------------

    // This function places the obstacle randomly
    //-------------------------------------------------------------
    function Rectangle(top,left,width,height)
    {
        this.Top    = top;
        this.Left   = left;
        this.Width  = width;
        this.Height = height;
    }

    // This function places the obstacle randomly
    //-------------------------------------------------------------
    function PlaceObstacle(objObstacle, xmin, xmax, ymin, ymax, wmin, wmax, hmin, hmax) {
        objObstacle.Width   = GetRandom(wmin, wmax);
        objObstacle.Height  = GetRandom(hmin, hmax);
        objObstacle.Left    = GetRandom(xmin, xmax-objObstacle.Width);
        objObstacle.Top     = GetRandom(ymin, ymax-objObstacle.Height);
    }

    // This function returns a random number in the specified range
    //-------------------------------------------------------------
    function GetRandom(min, max) {
        var num = Math.round(min + Math.random()*(max-min));
        return num;
    }

    // This function checks if the point (x,y) is inside the rectangle
    //--------------------------------------------------------------------
    function IsInside(x, y, left, top, width, height) {
        if (x > left && x < (left+width) && y > top && y < (top+height))
            return true;
        else
            return false;
    }

    //--------------------------------------------------------------------
    function CheckCollisionInside(x, y, left, top, width, height) {
        var right = left+width;
        var bottom = top+height;

        if (x > right) x = right;
        if (x < left) x = left;
        if (y > bottom) y = bottom;
        if (y < top) y = top;
        return {'x':x, 'y':y};
    }

    //--------------------------------------------------------------------
    function CheckCollisionOutside(x, y, xold, yold, left, top, width, height) {
        var right = left+width;
        var bottom = top+height;
        var collision = false;

        if ((x >= left && x <= right) && (y >= top && y <= bottom))
        {
            // Collision detected
            collision = true;

            if (xold <= left) {
                x = left;
            }
            if (xold >= right) {
                x = right;
            }
            if (yold <= top) {
                y = top;
            }
            if (yold >= bottom) {
                y = bottom;
            }
        }
        return {'collision':collision,  'x':x, 'y':y};
    }

    //--------------------------------------------------------------------
    function ShowPauseButton() {
        // Show the pause button
        var divPause = document.getElementById('divPause');
        divPause.style.display = "inline";

        // Hide the resume button
        var divResume = document.getElementById('divResume');
        divResume.style.display = "none";
    }

    //--------------------------------------------------------------------
    function ShowResumeButton() {
        // Hide the pause button
        var divPause = document.getElementById('divPause');
        divPause.style.display = "none";

        // Show the resume button
        var divResume = document.getElementById('divResume');
        divResume.style.display = "inline";
    }

    //--------------------------------------------------------------------
    function PauseGame() {

        // Save the timer state
        Game.TimeDiffSaved = (Game.EndTime - Game.StartTime)/1000 + Game.TimeDiffSaved;

        // Show the resume button
        ShowResumeButton();

        // Remove all the listeners
        RemoveEventListeners();
    }

    //--------------------------------------------------------------------
    function ResumeGame() {

        // Start the timer
        Game.StartTime = new Date();

        // Show the pause button
        ShowPauseButton();

        // Add all the listeners
        AddEventListeners();

        // Recalibrate the device
        Recalibrate();
    }

//--------------------------------------------------------------------
    function EnableHighScores() {
        if (localStorage.HighScore >= Game.HighScoreThreshold) {
            return true;
        }
        return false;
    }

    function GetHighScores() {
        var retArray = new Array();
        for (var i=0; i < localStorage.index; i++) {
            retArray[i] = localStorage.getObj(i);
        }
        return retArray;
    }

    function HighScores() {
        window.location.href = 'highscores.html';
    }
    //--------------------------------------------------------------------
    function Recalibrate() {
        Game.Roll0 = Game.Roll;
        Game.Pitch0 = Game.Pitch;
    }

    function wsOnOpen(evt) {
        var obj = new Object();
        var usrName;
        if (Game.UserName) {
            usrName = Game.UserName;
        }
        else {
            usrName = "Anonymous";
        }
        obj['name'] = usrName;
        obj['time'] = Game.TimeStr;
        obj['score'] = Game.SavedScore;
        obj['latitude'] = Game.latitude;
        obj['longitude'] = Game.longitude;

        var msg = JSON.stringify(obj);
        Game.Socket.send(msg);
    }

    function wsOnError(e) {
        // Log errors
        alert('WebSocket Error ' + e.data);

    }

    function wsOnMessage(e) {
        // Log messages from the server
        //alert('Message: ' + e.data); // as is

        var retobj = JSON.parse(e.data);

        var divMessage = document.getElementById('divMessage');
        divMessage.style.bottom = '0px';
        divMessage.style.right = '0px';
        divMessage.style.display = 'inline';
        divMessage.innerHTML = ' Information Saved :<br>' +
                                   '<b> Name :</b> '+retobj.name + '<br>' +
                                   '<b> Game Time :</b> '+retobj.time + '<br>' +
                                   '<b> Score :</b> '+retobj.score + '<br>' +
                                   '<b> Latitude :</b> '+retobj.latitude + '<br>' +
                                   '<b> Longitude :</b> '+retobj.longitude;
        Game.Socket.close();
    }

    function wsOnClose(e) {
        //alert("Socket closed");
    }

    // From http://stackoverflow.com/questions/3357553/how-to-store-an-array-in-localstorage
    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }