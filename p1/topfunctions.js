//
// Top Level Functions
//
// Shrikant Savant
//
//-------------------------------------------------------------
function LayoutPage() {

    // Get window size
    WinWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    WinHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    var btnHeight = 100;
    var btnWidth = 0.18*WinWidth;
    var top = Math.round((WinHeight-btnHeight)/2);
    var left = Math.round((WinWidth/6)-(btnWidth/2));
    var dx = Math.round(WinWidth/3);

    divButtons = document.getElementsByTagName('button');
    for (var i=0; i < divButtons.length; i++) {
        divButtons[i].style.width = btnWidth+'px';
        divButtons[i].style.height = btnHeight+'px';
    }

    divNewGame = document.getElementById('btnNewGame');
    divNewGame.style.top = top+'px';
    divNewGame.style.left = left+'px';

    divScores = document.getElementById('btnScores');
    divScores.style.top = top+'px';
    divScores.style.left = (left+dx)+'px';
    if (EnableHighScores()) {
        divScores.style.display = "inline";
    }
    else {
        divScores.style.display = "none";
    }


    divQuit = document.getElementById('btnQuit');
    divQuit.style.top = top+'px';
    divQuit.style.left = (left+2*dx)+'px';
}

//-------------------------------------------------------------
function NewGame() {
    // Start a new game
    window.location.href = 'game.html';
}

//-------------------------------------------------------------
function HighScores() {
    window.location.href = 'highscores.html';
}

//-------------------------------------------------------------
function QuitGame() {
    window.open('', '_self', '');
    window.self.close();
}
