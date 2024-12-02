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


wallList = [];

enemyList = [];

bonusList = [];

//* Wall/snake location storers

//* keyboard commands - this is a function expression
//* it does not get hoisted to the top of the function
//* but it can be used as an IIFE(immediately invoked function expression)!
let keyPressAction = (e) => {
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
            //* Heres where I would put my restart button IF I HAD ONE
            console.log("start restart");
            break;
    }
}

//*capture key presses
document.addEventListener("keydown", keyPressAction);
//* this is a function declaration, it gets hoisted to the top
function moveDir(motionDir){
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
                    if(newRockLeft == wallList[j].left & newRockTop == wallList[j].top){
                        console.log(wallList[j])
                        console.log("Rock hits wall");
                        return;
                    }
                } 
                for(let j = 0; j < enemyList.length; j++){
                    if (newRockLeft == enemyList[j].left & newRockTop == enemyList[j].top){
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
                    console.log("bird spots you");
            } 
        }
        if (enemyList[i].type == "snake"){
            if (newLeft <= enemyList[i].left + enemyList[i].viewDistance & newTop == enemyList[i].top){
                noBite = false
                for(let j = 0; j < wallList.length; j++){
                    if(wallList[j].left < newLeft && wallList[j].left > enemyList[i].left && enemyList[i].top == wallList[j].top){
                        console.log("Rock in way of snake");
                        noBite = true
                    }
                }
                if(noBite == false){
                    console.log("Snakebite");
                    gsap.to(`#${enemyList[i].name}`, {width: 200, duration:0.5, ease: "circ.out"});
                }
            } 
        }
    }
        for(let i = 0; i < bonusList.length; i++){
            if (newLeft == bonusList[i].left & newTop == bonusList[i].top){
            console.log(`I found a ${bonusList[i].type}!`);
            
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
let WallSpawnr = new WallSpawn("stats.json", document.querySelector("#playSpace"));

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
                        type: "bird",
                        top: birdTop,
                        left: birdLeft,
                        viewDistance: birdVision
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

let snakeOner = new enemySpawn("stats.json", document.querySelector("#playSpace"));


class collectableAdd{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let bonusShortcut = stats.levelInformation.levelOne.bonus
            console.log(bonusShortcut);
            for (let i = 0; i < bonusShortcut.length; i++){
                let beLife = document.createElement("div");
                let bonusType = bonusShortcut[i].collectableType
                beLife.classList.add(bonusType);
            
                let bonusTop = bonusShortcut[i].startPos[0];
                let bonusLeft = bonusShortcut[i].startPos[1];

                console.log(`bonus y: ${bonusTop} x: ${bonusLeft}`)
                gsap.to(beLife, {top: bonusTop, left:bonusLeft, duration:0});

                let bonusExample = {
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

let bowr = new collectableAdd("stats.json", document.querySelector("#playSpace"));

//* Rock movement (Check if space beyond rock is available is not no move rock)