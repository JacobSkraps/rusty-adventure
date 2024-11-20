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

snakeListTop = [];
snakeListLeft = [];

birdListTop = [];
birdListLeft = [];

bonusListTop = [];
bonusListLeft = [];

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
            console.log("wall");
            playBonk = true;
            console.log(`I am at ${heroTop} and ${heroLeft}`)
            heroLeft = prevLeft;
            heroTop = prevTop;
            return;
        }
    } 
    // for(let i = 0; i < wallList.length; i++){
    //     if (newLeft <= snakeListLeft + 150 & newTop == snakeListTop){
    //             console.log("Snakebite");
    //     } 
    // }
    //     for(let i = 0; i < wallList.length; i++){
    //         if (newLeft == bonusListLeft[i] & newTop == bonusListTop[i]){
    //         console.log("I found a bonus!");
            
    //     }
    // }
        
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

class Enemy{
    constructor(creatureName, viewDistance){
        this.creatureName = creatureName;
        this.viewDistance = viewDistance;
    }
    spotHero(){
        if (hero.pos.width >= this.pos+viewDistance && hero.pos.width <= this.pos-viewDistance){
            console.log("hero spotted");
        }
    }
}
class Eel extends Enemy{
    constructor(creatureName, sizeX, viewDistance){
        super(creatureName, viewDistance);
        this.sizeX = sizeX;
    }
    seeHero(){
        //* If you see the hero, move your entire body
        if (hero.pos.width <= this.pos+this.viewDistance){
            //interval to move
            moveDir({hs:this.sizeX, vs:0});
        }
        if (hero.pos.width >= this.pos-this.viewDistance){
            //interval to move
            moveDir({hs:-this.sizeX, vs:0});
        }
    }
}
class Bird extends Enemy{
    constructor(creatureName,viewDistance){
        super(creatureName,viewDistance);
    }
    seeHero(){
        //* Bind to a interval and don't stop until reach wall
        if (hero.pos.width <= this.pos+this.viewDistance){
            moveDir({hs:1, vs:0});
        }
        if (hero.pos.width >= this.pos-this.viewDistance){
            moveDir({hs:1, vs:0});
        }
    }
}

class Interactables {
    constructor(obstacleName, startPos, tangable){
        this.obstacleName = obstacleName;
        this.startPos = startPos;
        this.tangable = tangable;
    }
};
class Shell extends Interactables{
    constructor(obstacleName, tangable, hide){
        super(obstacleName, tangable);
        this.hiding = hiding
    }
    hideCrab(){
        if(hero.hiding==true){
            hero.style.opacity = 0;
            let shell = document.querySelector(`#${this.obstacleName}`);
            shell.style.scale = 1.2;
        }
        else{
            hero = document.querySelector("#hero")
            hero.style.opacity = 1;
            let shell = document.querySelector(`#${this.obstacleName}`);
            shell.style.scale = 1.2;
        }
    }
};
class Bonus extends Interactables{
    constructor(obstacleName, tangable, collected, collectableType){
        super(obstacleName, tangable);
        this.collectableType = collectableType
        this.collected = collected
        //* Put a little bow in the top left when bow is collected
    }
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
                beLife.classList.add("wall");

                if(wallShortcut[i].wallType=="oneLong"){
                    beLife.classList.add("oneLong");
                    let wallTop = wallShortcut[i].startPos[0];
                    let wallLeft = wallShortcut[i].startPos[1];
                    console.log(`Wall y: ${wallTop} x: ${wallLeft}`)
                    gsap.to(beLife, {top: wallTop, left:wallLeft, duration:0});
                    let wallExample = {
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
                        top: wallTop,
                        left: wallLeft
                    }
                    let wallExampleEx = {
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
                beLife.classList.add("wall");

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

//* Bow Collection doesn't work
// class bow{
//     constructor(dataSource, spawnArea){
//         fetch(dataSource, spawnArea)
//         .then(response => response.json())
//         .then(stats => {
//             this.bowList = stats.levelInformation.levelOne.bonus.collectableOne;
//             let beLife = document.createElement("div");
//             beLife.classList.add("bow");

//             // console.log(beLife);

//             let bowTop = stats.levelInformation.levelOne.bonus.collectableOne.startPos.split(", ")[1];
//             let bowLeft = stats.levelInformation.levelOne.bonus.collectableOne.startPos.split(", ")[2];
            
//             console.log(`Bow y: ${bowTop} x: ${bowLeft}`)
//             gsap.to(beLife, {top: bowTop, left:bowLeft, duration:0});

//             spawnArea.appendChild(beLife);
            
//         })
//         .catch(err =>console.log(err));

//     }
// }

class collectableAdd{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let bonusShortcut = stats.levelInformation.levelOne.bonus
            console.log(bonusShortcut);
            for (let i = 0; i < bonusShortcut.length; i++){
                let beLife = document.createElement("div");

                if(bonusShortcut[i].collectableType=="bow"){
                    beLife.classList.add("bow");
                    let bonusTop = bonusShortcut[i].startPos[0];
                    let bonusLeft = bonusShortcut[i].startPos[1];
                    bonusListTop.push(bonusTop);
                    bonusListLeft.push(bonusLeft);
                    console.log(`bonus y: ${bonusTop} x: ${bonusLeft}`)
                    gsap.to(beLife, {top: bonusTop, left:bonusLeft, duration:0});
                }
                
                spawnArea.appendChild(beLife);
            };

        })
        .catch(err =>console.log(err));
    }
}

let bowr = new collectableAdd("stats.json", document.querySelector("#playSpace"));

//* Rock movement (Check if space beyond rock is available is not no move rock)
// class Rock extends Obstacle{
//     constructor(obstacleName, tangable, pushable){
//         super(obstacleName, tangable);
//         this.pushable = pushable
//     }
// };