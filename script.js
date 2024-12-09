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

let heroTop = 400;
let heroLeft = 200;
hero.style.top = `${heroTop}px`;
hero.style.left = `${heroLeft}px`;
heroHiding = false;
heroAlive = true;
heroMovable = true;

wallList = [];
outWallList = [];

intervalList = [];

enemyList = [];

bonusList = [];

shellList = [];

endLocation = {};

currentLevel = 0;


//* Wall/snake location storers

//* keyboard commands - this is a function expression
//* it does not get hoisted to the top of the function
//* but it can be used as an IIFE(immediately invoked function expression)!
let keyPressAction = (e) => {
    if (heroMovable == false){
        return;
    }
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
                    if (enemyList[j].type !== "roaming"){
                        if (newRockLeft == enemyList[j].left && newRockTop == enemyList[j].top){
                            console.log("Rock hits enemy");
                            return;
                        }
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
    for(let i = 0; i < outWallList.length; i++){
        if (newTop >= outWallList[i].startY && newTop < outWallList[i].endY){
            if(newLeft >= outWallList[i].startX && newLeft < outWallList[i].endX){
                console.log("crab hit outer wall");
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
                        if (heroAlive == false){
                            clearInterval(birdMove);
                        }
                        birdLeft = birdLeft+50
                        gsap.to(`#${enemyList[i].name}`, {left:birdLeft, duration: .4 });
                        console.log("bird move")
                        if(heroAlive == true && heroHiding == false){
                            if(enemyList[i].top == heroTop && birdLeft == heroLeft || heroAlive == false){
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
                                gsap.to(`#${enemyList[i].name}`, {left:birdLeft+200, duration: .8 , delay: .6, opacity:0, ease: "power1.in"});
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
                    gsap.to(`#${enemyList[i].name}`, {width: snakeExtend, height:50, duration:0.5, ease: "circ.out"});
                    heroDie();
                    heroAlive = false
                }
            } 
        }
    }
        for(let i = 0; i < bonusList.length; i++){
            if (newLeft == bonusList[i].left & newTop == bonusList[i].top){
            console.log(`I found a ${bonusList[i].type}!`);
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
    if (heroTop >= endLocation.startY && heroTop < endLocation.endY){
        if(heroLeft >= endLocation.startX && heroLeft < endLocation.endX){
        console.log("Level Finish");
        heroWin();
        heroAlive = false
        }
    }
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

function startRoamer(){
    console.log("roamers");
    let roamers = enemyList.filter(enemy => enemy.type == "roaming")
    console.log(roamers);

    for(let i = 0; i < roamers.length; i++){
        let roamingLeft = roamers[i].left
        let roamingTop = roamers[i].top
        let roamRoute = roamers[i].path
        let enemyTarget = enemyList[i].name
        console.log(roamRoute);
        //* variable for storing place in route
        let count = 0;
            let roamMove = setInterval(() => {
                if (heroAlive == false){
                    clearInterval(roamMove);
                }
                //* Determine if you are going Left/Right
                if (roamRoute[count] == "Right"){
                    roamingLeft = roamingLeft + 50
                    reflect = -1
                }
                else if (roamRoute[count] == "Left"){
                    roamingLeft = roamingLeft - 50
                    reflect = 1
                }
                else if (roamRoute[count] == "Up"){
                    roamingTop = roamingTop - 50
                    reflect = -1
                }      
                else if (roamRoute[count] == "Down"){
                    roamingTop = roamingTop + 50
                    reflect = 1
                }            
                // console.log(roamingLeft)    
                gsap.to(`#${enemyTarget}`, {left:roamingLeft, top: roamingTop, duration: .4, scaleX: reflect });
                // console.log("roam move")

                if(heroAlive == true && heroHiding == false){
                    if(roamingTop == heroTop && roamingLeft == heroLeft || heroAlive == false){
                        console.log("The fish got you!");
                        clearInterval(roamMove);
                        //* Declare hero dead
                        heroDie();
                        heroAlive = false
                    }
                }

                count++;
                if(count == roamRoute.length){
                    count = 0;
                }
            }, 400);
            let roamExample = {
                name: roamers[i].name,
                interval: roamMove
            }
            intervalList.push(roamExample);
        }
}

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
    myPara.classList.add("Text");
    myPara2.classList.add("Text");

    gsap.fromTo(".deadText", {opacity:0, y:-800}, {opacity:1, y: 0, duration: 1, ease: "bounce"});
    gsap.to("#playSpace", {css:{ 'filter': 'grayscale(100%)'}, duration: 1, ease:"bounce"});
    setTimeout(startRound, 2500);

};

function heroWin(){
    console.log("Hero got to the goal!");
    if(currentLevel <= 2){
        currentLevel++;
        let header = "Nice Job!";
        let myPhrase = "Do it again.";
        let pageBody = document.querySelector("#playSpace");
        let myPara = document.createElement("p");
        let myPara2 = document.createElement("p");

        myPara2.innerText = header;
        myPara.innerText = myPhrase;
        pageBody.appendChild(myPara2);
        pageBody.appendChild(myPara);
        myPara2.classList.add("winText");
        myPara.classList.add("winText");
        myPara.classList.add("Text");
        myPara2.classList.add("Text");

        gsap.fromTo(".winText", {opacity:0, y:-800}, {opacity:1, y: 0, duration: 1, ease: "bounce"});
        gsap.to("#playSpace", {css:{ 'filter': 'brightness(90%)'}, duration: 1, ease:"bounce"});
        setTimeout(startRound, 2500);
    }
    else{
        console.log("Game complete!");
    }
};

class WallSpawn{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let shortCut = stats.levelInformation
            function wallCreate(shortCut){
                shortCut[currentLevel].Walls
                console.log(wallShortcut);
                for (let i = 0; i < wallShortcut.length; i++){
                    let beLife = document.createElement("div");
                    let name = `wall${[i]}`
                    beLife.id = name
                    beLife.classList.add("wall");
                    beLife.classList.add("removeable");
    
    
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
            }(shortCut);
            function outWallCreate(shortCut){
                let outWallShortcut = shortCut[currentLevel].OutWalls

                console.log(outWallShortcut);
                for (let i = 0; i < outWallShortcut.length; i++){
                    let beLife = document.createElement("div");
                    let name = `wall${[i]}`
                    beLife.id = name
                    beLife.classList.add("outWall");
                    beLife.classList.add("removeable");
    
    
                    if(outWallShortcut[i].face=="Right"){
                        beLife.classList.add("OutWallLeft");
                    }
                    else if(outWallShortcut[i].face=="Left"){
                        beLife.classList.add("OutWallRight");
                    }
                    else{
                        beLife.classList.add("OutWallTop");
                    }
    
                    let wallStartTop = outWallShortcut[i].startPos[0];
                    let wallStartLeft = outWallShortcut[i].startPos[1];
                    let wallEndTop = outWallShortcut[i].endPos[0];
                    let wallEndLeft = outWallShortcut[i].endPos[1];
                    let wallHeight = wallEndTop - wallStartTop
                    let wallWidth = wallEndLeft - wallStartLeft
        
                    console.log(`end start y: ${wallStartTop} x: ${wallStartLeft} end  y: ${wallEndTop} x: ${wallEndLeft}, width: ${wallWidth} height: ${wallHeight}`)
                    gsap.to(beLife, {top: wallStartTop, left:wallStartLeft, duration:0, width: wallWidth, height: wallHeight});
        
                    let outWallExample = {
                        startY: wallStartTop,
                        startX: wallStartLeft,
                        endY: wallEndTop,
                        endX: wallEndLeft,
                    }
                    outWallList.push(outWallExample);
                    
                    spawnArea.appendChild(beLife);
                };
            }(shortCut);
            function enemyCreate(shortCut){
                let enemyShortcut = shortCut[currentLevel].Enemies
                console.log(enemyShortcut);
                    for (let i = 0; i < enemyShortcut.length; i++){
                        let beLife = document.createElement("div");
                        let name = `enemy${[i]}`
                        beLife.id = name
                        beLife.classList.add("enemy");
                        beLife.classList.add("removeable");
        
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
                        else if(enemyShortcut[i].type=="roaming"){
                            beLife.classList.add("roaming");
        
                            let roamingTop = enemyShortcut[i].startPos[0];
                            let roamingLeft = enemyShortcut[i].startPos[1];
                            let roamingPath = enemyShortcut[i].route;
        
                            //* Storing values outside of loop
        
                            console.log(`roaming y: ${roamingTop} x: ${roamingLeft}`)
                            gsap.to(beLife, {top: roamingTop, left:roamingLeft, duration:0});
        
                            let roamingExample = {
                                name: name,
                                type: "roaming",
                                top: roamingTop,
                                left: roamingLeft,
                                path: roamingPath
                            }
                            enemyList.push(roamingExample);
                        }
                        
                        spawnArea.appendChild(beLife);
                    };
            }(shortCut);
            function bonusCreate(shortCut){
                let bonusShortcut = shortCut[currentLevel].bonus

                console.log(bonusShortcut);
                for (let i = 0; i < bonusShortcut.length; i++){
                    let beLife = document.createElement("div");
                    let name = `collectable${[i]}`
                    beLife.id = name;
                    let bonusType = bonusShortcut[i].collectableType;
                    beLife.classList.add(bonusType);
                    beLife.classList.add("collectable");
                    beLife.classList.add("removeable");
                
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
            }(shortCut);
            function interactCreate(shortCut){
                let interactShortcut = shortCut[currentLevel].Interactables
                console.log(interactShortcut);
                for (let i = 0; i < interactShortcut.length; i++){
                    let beLife = document.createElement("div");
                    let name = `shell${[i]}`
                    beLife.id = name
                    let interactType = interactShortcut[i].type
                    beLife.classList.add(interactType);
                    beLife.classList.add("removeable");
    
                
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
            }(shortCut);
            function outWallCreate(shortCut){
                let endShortcut = shortCut[currentLevel].End
                console.log(endShortcut);
                let beLife = document.createElement("div");
                beLife.classList.add("endZone");
                beLife.classList.add("removeable");
    
            
                let endStartTop = endShortcut.startPos[0];
                let endStartLeft = endShortcut.startPos[1];
                let endEndTop = endShortcut.endPos[0];
                let endEndLeft = endShortcut.endPos[1];
                let endHeight = endEndTop - endStartTop
                let endWidth = endEndLeft - endStartLeft
    
                console.log(`end start y: ${endStartTop} x: ${endStartLeft} end  y: ${endEndTop} x: ${endEndLeft}, width: ${endWidth} height: ${endHeight}`)
                gsap.to(beLife, {top: endStartTop, left:endStartLeft, duration:0, width: endWidth, height: endHeight});
    
                endLocation = {
                    startY: endStartTop,
                    startX: endStartLeft,
                    endY: endEndTop,
                    endX: endEndLeft,
                }            
                spawnArea.appendChild(beLife);
            }(shortCut);
        })

        .catch(err =>console.log(err));
    }
}

class OutWallSpawn{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let outWallShortcut = stats.levelInformation.levelOne.OutWalls

            console.log(outWallShortcut);
            for (let i = 0; i < outWallShortcut.length; i++){
                let beLife = document.createElement("div");
                let name = `wall${[i]}`
                beLife.id = name
                beLife.classList.add("outWall");
                beLife.classList.add("removeable");


                if(outWallShortcut[i].face=="Right"){
                    beLife.classList.add("OutWallLeft");
                }
                else if(outWallShortcut[i].face=="Left"){
                    beLife.classList.add("OutWallRight");
                }
                else{
                    beLife.classList.add("OutWallTop");
                }

                let wallStartTop = outWallShortcut[i].startPos[0];
                let wallStartLeft = outWallShortcut[i].startPos[1];
                let wallEndTop = outWallShortcut[i].endPos[0];
                let wallEndLeft = outWallShortcut[i].endPos[1];
                let wallHeight = wallEndTop - wallStartTop
                let wallWidth = wallEndLeft - wallStartLeft
    
                console.log(`end start y: ${wallStartTop} x: ${wallStartLeft} end  y: ${wallEndTop} x: ${wallEndLeft}, width: ${wallWidth} height: ${wallHeight}`)
                gsap.to(beLife, {top: wallStartTop, left:wallStartLeft, duration:0, width: wallWidth, height: wallHeight});
    
                let outWallExample = {
                    startY: wallStartTop,
                    startX: wallStartLeft,
                    endY: wallEndTop,
                    endX: wallEndLeft,
                }
                outWallList.push(outWallExample);
                
                spawnArea.appendChild(beLife);
            };

        })
        
        .catch(err =>console.log(err));
    }
}

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
                beLife.classList.add("removeable");

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
                else if(enemyShortcut[i].type=="roaming"){
                    beLife.classList.add("roaming");

                    let roamingTop = enemyShortcut[i].startPos[0];
                    let roamingLeft = enemyShortcut[i].startPos[1];
                    let roamingPath = enemyShortcut[i].route;

                    //* Storing values outside of loop

                    console.log(`roaming y: ${roamingTop} x: ${roamingLeft}`)
                    gsap.to(beLife, {top: roamingTop, left:roamingLeft, duration:0});

                    let roamingExample = {
                        name: name,
                        type: "roaming",
                        top: roamingTop,
                        left: roamingLeft,
                        path: roamingPath
                    }
                    enemyList.push(roamingExample);
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
                let name = `collectable${[i]}`
                beLife.id = name;
                let bonusType = bonusShortcut[i].collectableType;
                beLife.classList.add(bonusType);
                beLife.classList.add("collectable");
                beLife.classList.add("removeable");
            
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
                beLife.classList.add("removeable");

            
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

class endAdd{
    constructor(dataSource, spawnArea){
        fetch(dataSource, spawnArea)
        .then(response => response.json())
        .then(stats => {
            let endShortcut = stats.levelInformation.levelOne.End
            console.log(endShortcut);
            let beLife = document.createElement("div");
            beLife.classList.add("endZone");
            beLife.classList.add("removeable");

        
            let endStartTop = endShortcut.startPos[0];
            let endStartLeft = endShortcut.startPos[1];
            let endEndTop = endShortcut.endPos[0];
            let endEndLeft = endShortcut.endPos[1];
            let endHeight = endEndTop - endStartTop
            let endWidth = endEndLeft - endStartLeft

            console.log(`end start y: ${endStartTop} x: ${endStartLeft} end  y: ${endEndTop} x: ${endEndLeft}, width: ${endWidth} height: ${endHeight}`)
            gsap.to(beLife, {top: endStartTop, left:endStartLeft, duration:0, width: endWidth, height: endHeight});

            endLocation = {
                startY: endStartTop,
                startX: endStartLeft,
                endY: endEndTop,
                endX: endEndLeft,
            }            
            spawnArea.appendChild(beLife);
        })
        .catch(err =>console.log(err));
    }
}

// let shellr = new interactableAdd("stats.json", document.querySelector("#playSpace"));
function resetPos(){
    //* Put the hero in his place
    heroTop = 400;
    heroLeft = 200;
    heroHiding = false;
    heroAlive = true;
    gsap.to(hero, {top: heroTop, left:heroLeft, duration: 0 });
}
function disableControls(){
    //* I am lazy, this is here so that I can use setTimeout
    heroMovable = true;
    heroAlive = true;
}
function spawnStuff(){
    let wallSpawnr = new WallSpawn("stats.json", document.querySelector("#playSpace"));
    let outWallSpawnr = new OutWallSpawn("stats.json", document.querySelector("#playSpace"));
    let enemySpawnr = new enemySpawn("stats.json", document.querySelector("#playSpace"));
    let collectableSpawnr = new collectableAdd("stats.json", document.querySelector("#playSpace"));
    let shellSpawnr = new interactableAdd("stats.json", document.querySelector("#playSpace"));
    let endSpawnr = new endAdd("stats.json", document.querySelector("#playSpace"));
    setTimeout(startRoamer, 100);
    

}
function startRound(){
    heroAlive = false;
    heroMovable = false;
    wallList = [];
    enemyList = [];
    bonusList = [];
    shellList = [];
    endList = [];


    //* Remove all elements
    function removeElementsByClass(removeable){
        console.log("Starting removing");
        const elements = document.getElementsByClassName(removeable);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
            console.log("Removed element");
        }
    };
    removeElementsByClass('removeable');
    removeElementsByClass('Text');
    gsap.to("#playSpace", {css:{ 'filter': 'grayscale(0%)'}, duration: 1, ease:"bounce"});

    setTimeout(resetPos, 300);
    setTimeout(spawnStuff, 300);
    setTimeout(disableControls, 400);
};
startRound();

// let wallSpawnr = new WallSpawn("stats.json", document.querySelector("#playSpace"));
// let enemySpawnr = new enemySpawn("stats.json", document.querySelector("#playSpace"));
// let collectableSpawnr = new collectableAdd("stats.json", document.querySelector("#playSpace"));
// let shellSpawnr = new interactableAdd("stats.json", document.querySelector("#playSpace"));
