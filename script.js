//* reference speed
let speed = 50;

//* reference for audio
let footsteps = document.querySelector("#moveSound");
let bonkers = document.querySelector("#bonk");

//* reference the bounds of the play area;
let playSpace = document.querySelector("#playSpace");

//* reference the main character
let hero = document.querySelector("#hero");
let heroPos = hero.getBoundingClientRect();
console.log(heroPos.width);
let heroTop = 400;
let heroLeft = 400;
hero.style.top = `${heroTop}px`;
hero.style.left = `${heroLeft}px`;
heroHiding = false;
heroAlive = true;

wallList = [];

enemyList = [];

bonusList = [];

shellList = [];

//* Wall/snake location storers

//* keyboard commands - this is a function expression
//* it does not get hoisted to the top of the function
//* but it can be used as an IIFE(immediately invoked function expression)!
let keyPressAction = (e) => {
    console.log(e);
    switch(e.keyCode){
        
        case 38:
            moveDir({hs:0, vs:-1});
            break;
        case 40:
            moveDir({hs:0, vs:1});
            break;
        case 37:
            moveDir({hs:-1, vs:0});
            break
        case 39:
            moveDir({hs:1, vs:0});
            break;
        case 82:            
            console.log("start restart");
            startRound();
            break;
        case 69:
            //* Hide
            for(let i = 0; i < shellList.length; i++){
                if(heroLeft == shellList[i].left & heroTop == shellList[i].top){
                    console.log("Hide");
                    hide();
                    break;
                }
            };
    }
}

//*capture key presses
document.addEventListener("keydown", keyPressAction);
//* this is a function declaration, it gets hoisted to the top
function moveDir(motionDir){
    if (heroHiding == true){
        return;
    }
    if (heroAlive == false){
        return;
    }
    prevLeft = heroLeft;
    prevTop =  heroTop;

    newLeft = heroLeft + (speed*motionDir.hs);
    newTop =  heroTop + (speed*motionDir.vs);
    let playBonk = false;
    for(let i = 0; i < wallList.length; i++){
        if(newLeft == wallList[i].left & newTop == wallList[i].top){
            if (wallList[i].type == "rock"){
                newRockLeft = wallList[i].left + (speed*motionDir.hs);
                newRockTop =  wallList[i].top + (speed*motionDir.vs);
                for(let j = 0; j < wallList.length; j++){
                    if(newRockLeft == wallList[j].left && newRockTop == wallList[j].top){
                        console.log(wallList[j])
                        console.log("Rock hits wall");
                        return;
                    }
                } 
                for(let j = 0; j < enemyList.length; j++){
                    if (newRockLeft == enemyList[j].left && newRockTop == enemyList[j].top){
                        console.log("Rock hits enemy");
                        return;
                    }
                }
                console.log("rock push");
                console.log(`Rock is at ${newRockTop} and ${newRockLeft}`)
                gsap.to(`#${wallList[i].name}`, {top: newRockTop, left:newRockLeft, duration:0.5, ease: "circ.out"});
                console.log(`I am at ${heroTop} and ${heroLeft}`)
                wallList[i].left = newRockLeft;
                wallList[i].top = newRockTop;
                heroLeft = prevLeft;
                heroTop = prevTop;
                return;
            } else{
            console.log(`${wallList[i].name}`);
            playBonk = true;
            console.log(`I am at ${heroTop} and ${heroLeft}`)
            heroLeft = prevLeft;
            heroTop = prevTop;
            return;
            }
        }
    }
    for(let i = 0; i < enemyList.length; i++){
        if (enemyList[i].type == "bird"){
            if (newLeft <= enemyList[i].left + enemyList[i].viewDistance & newTop == enemyList[i].top){
                if(enemyList[i].hunting == false){
                    console.log("bird spots you");

                    enemyList[i].hunting = true
                    let birdLeft = enemyList[i].left

                    //*Interval for bird moving
                    let birdMove = setInterval(() => {
                        birdLeft = birdLeft+50
                        gsap.to(`#${enemyList[i].name}`, {left:birdLeft, duration: .4 });
                        console.log("bird move")
                        if(heroAlive == true && heroHiding == false){
                            if(enemyList[i].top == heroTop && birdLeft == heroLeft){
                                console.log("The bird got you!");
                                clearInterval(birdMove);
                                    heroDie();
                                    heroAlive = false
                                }
                            }
                        for(let j = 0; j < wallList.length; j++){
                            if(birdLeft == wallList[j].left && enemyList[i].top == wallList[j].top){
                                console.log("bird hit wall");
                                clearInterval(birdMove);
                            }
                        }
                    }, 400);
                }
                if(enemyList[i].top == heroTop && enemyList[i].left == heroLeft){
                    console.log("The bird got you!");
                }
            } 
        }
        if (enemyList[i].type == "snake"){
            if (newLeft <= enemyList[i].left + enemyList[i].viewDistance & newTop == enemyList[i].top){
                    //* Store for snakebite if snakebite is true
                    noBite = false
                    //* Loop to figure out if rock if between hero and snake
                    for(let j = 0; j < wallList.length; j++){
                    if(wallList[j].left < newLeft && wallList[j].left > enemyList[i].left && enemyList[i].top == wallList[j].top){
                        console.log("Rock in way of snake");
                        noBite = true
                    }
                }
                if(noBite == false){
                    console.log("Snakebite");
                    let snakeExtend = newLeft - enemyList[i].left + 50
                    gsap.to(`#${enemyList[i].name}`, {width: snakeExtend, duration:0.5, ease: "circ.out"});
                    heroDie();
                    heroAlive = false
                }
            } 
        }
    }
        for(let i = 0; i < bonusList.length; i++){
            if (newLeft == bonusList[i].left & newTop == bonusList[i].top){
            console.log(`I found a ${bonusList[i].type}!`);
            console.log(`${bonusList[i].name}`);
            gsap.to(`#${bonusList[i].name}`, {opacity: 0, duration:0.5, ease: "circ.out"});
        }
    }
        
        if(newLeft>0 && newLeft<playSpace.clientWidth - (heroPos.width)){
            heroLeft = newLeft;
        }else if(newLeft<=0){
            heroLeft = 0;
            playBonk = true;
        }else{
            heroLeft = playSpace.clientWidth-heroPos.width;
            playBonk = true;
        }
        if(newTop>0 && newTop<playSpace.clientHeight - (heroPos.width/2)){
            heroTop = newTop;
        }else if(newTop<=0){
            heroTop = 0;
            playBonk = true;
        }else{
            heroTop = playSpace.clientHeight-heroPos.height;
            playBonk = true;
        }
        if(playBonk==true){
            bonkers.currentTime = 0;
            bonkers.play();
        }else{
            footsteps.currentTime = 0;
            footsteps.play();
        }
        console.log(`I am at ${heroTop} and ${heroLeft}`)
    
    gsap.to(hero, {top: heroTop, left:heroLeft, duration: .5 });
    //Put timeout on movement
}

function hide(){
    if(heroHiding == false){
        gsap.to(hero, {scale: 0.25, opacity:0, duration: 1, ease:"power1.in"});
        heroHiding = true;
    }
    else if(heroHiding == true){
        gsap.to(hero, {scale: 1, opacity:1, duration: 1, ease:"power1.in"});
        heroHiding = false;
    }
};

function heroDie(){
    console.log("Hero is dead!");

    let header = "Oh no,";
    let myPhrase = "Rusty died!";
    let pageBody = document.querySelector("#playSpace");
    let myPara = document.createElement("p");
    let myPara2 = document.createElement("p");

    myPara2.innerText = header;
    myPara.innerText = myPhrase;
    pageBody.appendChild(myPara2);
    pageBody.appendChild(myPara);
    myPara2.classList.add("deadText");
    myPara.classList.add("deadText");
    gsap.fromTo(".deadText", {opacity:0, y:-800}, {opacity:1, y: 0, duration: 1, ease: "bounce"});
    gsap.to("#playSpace", {css:{ 'filter': 'grayscale(100%)'}, duration: 1, ease:"bounce"});
};

class WallSpawn{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let wallShortcut = stats.levelInformation.levelOne.Walls

            console.log(wallShortcut);
            for (let i = 0; i < wallShortcut.length; i++){
                let beLife = document.createElement("div");
                let name = `wall${[i]}`
                beLife.id = name
                beLife.classList.add("wall");

                if(wallShortcut[i].wallType=="rock"){
                    beLife.classList.add("rock");
                    let rockTop = wallShortcut[i].startPos[0];
                    let rockLeft = wallShortcut[i].startPos[1];
                    console.log(`rock y: ${rockTop} x: ${rockLeft}`)
                    gsap.to(beLife, {top: rockTop, left:rockLeft, duration:0});
                    let rockExample = {
                        name: name,
                        type: "rock",
                        top: rockTop,
                        left: rockLeft
                    }
                    wallList.push(rockExample);
                }
                else if(wallShortcut[i].wallType=="oneLong"){
                    beLife.classList.add("oneLong");
                    let wallTop = wallShortcut[i].startPos[0];
                    let wallLeft = wallShortcut[i].startPos[1];
                    console.log(`Wall y: ${wallTop} x: ${wallLeft}`)
                    gsap.to(beLife, {top: wallTop, left:wallLeft, duration:0});
                    let wallExample = {
                        name: name,
                        type: "wall",
                        top: wallTop,
                        left: wallLeft,
                    }
                    wallList.push(wallExample);
                }
                else{
                    beLife.classList.add("twoLong");
                    let wallTop = wallShortcut[i].startPos[0];
                    let wallLeft = wallShortcut[i].startPos[1];
                    console.log(`Wall y: ${wallTop} x: ${wallLeft}`)
                    gsap.to(beLife, {top: wallTop, left:wallLeft, duration:0});
                    let wallExample = {
                        name: name,
                        type: "wall",
                        top: wallTop,
                        left: wallLeft
                    }
                    let wallExampleEx = {
                        name: name,
                        type: "wall",
                        top: wallTop,
                        left: wallLeft+50
                    }
                    wallList.push(wallExample);
                    wallList.push(wallExampleEx);
                }
                
                spawnArea.appendChild(beLife);
            };

        })
        .catch(err =>console.log(err));
    }
}
// let WallSpawnr = new WallSpawn("stats.json", document.querySelector("#playSpace"));

//* Player detection for snake is off loaded to play movement

class enemySpawn{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let enemyShortcut = stats.levelInformation.levelOne.Enemies

            console.log(enemyShortcut);
            for (let i = 0; i < enemyShortcut.length; i++){
                let beLife = document.createElement("div");
                let name = `enemy${[i]}`
                beLife.id = name
                beLife.classList.add("enemy");

                if(enemyShortcut[i].type=="bird"){
                    beLife.classList.add("bird");

                    let birdTop = enemyShortcut[i].startPos[0];
                    let birdLeft = enemyShortcut[i].startPos[1];
                    let birdVision = enemyShortcut[i].viewDistance;

                    console.log(`bird y: ${birdTop} x: ${birdLeft}`)
                    gsap.to(beLife, {top: birdTop, left:birdLeft, duration:0});

                    //* Storing values outside of loop
                    let birdExample = {
                        name: name,
                        type: "bird",
                        top: birdTop,
                        left: birdLeft,
                        viewDistance: birdVision,
                        hunting: false
                    }
                    enemyList.push(birdExample);
                } 
                else if(enemyShortcut[i].type=="snake"){
                    beLife.classList.add("snake");

                    let snakeTop = enemyShortcut[i].startPos[0];
                    let snakeLeft = enemyShortcut[i].startPos[1];
                    let snakeVision = enemyShortcut[i].viewDistance;

                    //* Storing values outside of loop

                    console.log(`snake y: ${snakeTop} x: ${snakeLeft}`)
                    gsap.to(beLife, {top: snakeTop, left:snakeLeft, duration:0});

                    let snakeExample = {
                        name: name,
                        type: "snake",
                        top: snakeTop,
                        left: snakeLeft,
                        viewDistance: snakeVision
                    }
                    enemyList.push(snakeExample);
                }
                
                spawnArea.appendChild(beLife);
            };

        })
        .catch(err =>console.log(err));
    }
}

// let snakeOner = new enemySpawn("stats.json", document.querySelector("#playSpace"));


class collectableAdd{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let bonusShortcut = stats.levelInformation.levelOne.bonus
            console.log(bonusShortcut);
            for (let i = 0; i < bonusShortcut.length; i++){
                let beLife = document.createElement("div");
                let name = `collectableSpawn{[i]}`
                beLife.id = name
                let bonusType = bonusShortcut[i].collectableType
                beLife.classList.add(bonusType);
            
                let bonusTop = bonusShortcut[i].startPos[0];
                let bonusLeft = bonusShortcut[i].startPos[1];

                console.log(`bonus y: ${bonusTop} x: ${bonusLeft}`)
                gsap.to(beLife, {top: bonusTop, left:bonusLeft, duration:0});

                let bonusExample = {
                    name: name,
                    type: bonusType,
                    top: bonusTop,
                    left: bonusLeft,
                }
                bonusList.push(bonusExample);
                
                spawnArea.appendChild(beLife);
            };
        })
        .catch(err =>console.log(err));
    }
}

// let bowr = new collectableAdd("stats.json", document.querySelector("#playSpace"));

class interactableAdd{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let interactShortcut = stats.levelInformation.levelOne.Interactables
            console.log(interactShortcut);
            for (let i = 0; i < interactShortcut.length; i++){
                let beLife = document.createElement("div");
                let name = `shell${[i]}`
                beLife.id = name
                let interactType = interactShortcut[i].type
                beLife.classList.add(interactType);
            
                let shellTop = interactShortcut[i].startPos[0];
                let shellLeft = interactShortcut[i].startPos[1];

                console.log(`shell y: ${shellTop} x: ${shellLeft}`)
                gsap.to(beLife, {top: shellTop, left:shellLeft, duration:0});

                let shellExample = {
                    name: name,
                    type: interactType,
                    top: shellTop,
                    left: shellLeft,
                }
                shellList.push(shellExample);
                
                spawnArea.appendChild(beLife);
            };
        })
        .catch(err =>console.log(err));
    }
}

// let shellr = new interactableAdd("stats.json", document.querySelector("#playSpace"));

function startRound(){
    wallList = [];
    enemyList = [];
    bonusList = [];
    shellList = [];

    heroTop = 400;
    heroLeft = 400;

    let wallSpawnr = new WallSpawn("stats.json", document.querySelector("#playSpace"));
    let enemySpawnr = new enemySpawn("stats.json", document.querySelector("#playSpace"));
    let collectableSpawnr = new collectableAdd("stats.json", document.querySelector("#playSpace"));
    let shellSpawnr = new interactableAdd("stats.json", document.querySelector("#playSpace"));
};
startRound();