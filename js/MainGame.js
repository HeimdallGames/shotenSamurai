/*global Stage Character animations images sounds musicActivated*/
/*exported MainGame*/
const dificulty = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
    HELL: 3,
};

const levelPoints = {
    MEDIUM: 80,
    HARD: 180,
    HELL: 450,
};

class MainGame {
    constructor() {
        this.aspectRatio = 2.1;
        this.paintRefresh = 25;
        this.logicRefresh = 12;
        this.obstacleRefresh=2000; //this gonna change with difficulty
        this.canvas = document.getElementById("mainGame");
        this.loadingProgress = document.getElementById("loadingProgress");
        this.ctx = this.canvas.getContext("2d");
      //  this.arrayObjects;
    }

    startLogic(){
        this.actualLevel = dificulty.EASY;
        this.actualCutImage = images.obstacle_cut_easy;
        this.actualHitImage = images.obstacle_hit_easy;
        this.actualCutImageDeath = images.obstacle_hit_easy;
        this.stage = new Stage(this.ctx, images.scene_start, images.scene_easy);
        this.character = new Character(this.ctx, animations.character_walk_izq,animations.character_jumping_izq,animations.character_land_izq,animations.character_walk_der,animations.character_jumping_der,animations.character_land_der,animations.character_air_izq,animations.character_air_der,animations.character_death,animations.character_death_fall,sounds.jump,sounds.death);
        this.arrayObjects = [];
    }
    startGame(){
        this.startLogic();
        window.addEventListener("resize",this.resizeCanvas.bind(this), false);
        this.resizeCanvas();
        this.repaint();
        if(musicActivated){
            sounds.music.loop = true;
            sounds.music.play();
        }
        this.paintInterval = setInterval(this.repaint.bind(this), this.paintRefresh);
        this.logicInterval = setInterval(this.updateGameLogic.bind(this), this.logicRefresh);
        this.obstacleInterval=setInterval(this.genObstacle.bind(this),this.obstacleRefresh);
    }
    
    updateGameLogic(){
        //let logicStart = (new Date()).getMilliseconds();//Debug performance
        this.stage.update();
        this.character.update();
        let index;
        this.arrayObjects.forEach(function(element) {
            //To delete items that are not on the screen
            if(element.relativePosY>=1 || element.isDestroyed){
                index=this.arrayObjects.indexOf(element);
            }
            element.update();
            
        }.bind(this));
        if(index>-1){
            this.arrayObjects.splice(index,1);
        }
        //todo: Generar nuevos hitObject

        /**Debug performance*
    	let oldLogic = this.lastLogic
    	this.lastLogic = (new Date()).getMilliseconds();
	    console.log("lastLogic: "+this.lastLogic+ " logicIterval: "+(this.lastLogic-oldLogic)+" logicDuration: "+(this.lastLogic-logicStart));//*/
    }

    //Generate obstacles for the character to evade or destroy
    genObstacle(){
        let probabilityOfItem=Math.floor(Math.random() * (101 - 0)) + 0;
        let posX;
        let posY;

        if(probabilityOfItem>=20){
            // Does 10 tries to generate objects
            for(var i=0;i<10;i++){
                posX=Number(Math.random()*(0.6-0.15)+0.15);
                posX=posX.toFixed(3);
                posY=0.2;
                //El primero lo hace bien, el resto no...?
                //Al coger la posicion de la X ?    
                if(this.arrayObjects.length<=0){
                    var obstacle=new HitObject(this.ctx,posY,posX,
                        animations.obstacle_wall,animations.character_death,
                        this.character,false,0.01);
                        obstacle.resize(this.canvasWidth,this.canvasHeight);
                        this.arrayObjects.push(obstacle);
                       
                        return true;
                }else if(this.checkPosition(posX,posY,this.arrayObjects)){
                        var obstacle=new HitObject(this.ctx,posY,posX,
                        animations.obstacle_wall,animations.character_death,
                        this.character,false,0.01);
                        obstacle.resize(this.canvasWidth,this.canvasHeight);
                        this.arrayObjects.push(obstacle);
                        
                        return true;
                }
            }
            return false;
        }else{
            for(var i=0;i<10;i++){
                posX=Number(Math.random()*(0.6-0.15)+0.15);
                posX=posX.toFixed(3);
                posY=0.2;
                //El primero lo hace bien, el resto no...?
                //Al coger la posicion de la X ?    
                if(this.arrayObjects.length<=0){
                    var obstacle=new HitObject(this.ctx,posY,posX,
                        animations.character_death,animations.obstacle_wall,
                        this.character,true,0.01);
                        obstacle.resize(this.canvasWidth,this.canvasHeight);
                        this.arrayObjects.push(obstacle);
                       
                        return true;
                }else if(this.checkPosition(posX,posY,this.arrayObjects)){
                        var obstacle=new HitObject(this.ctx,posY,posX,
                        animations.character_death,animations.obstacle_wall,
                        this.character,true,0.01);
                        obstacle.resize(this.canvasWidth,this.canvasHeight);
                        this.arrayObjects.push(obstacle);
                        
                        return true;
                }
            }
            return false;
        }

    }
    
    //Needed to check offsets of new items
    checkPosition(relativePosX_,relativePosY_,objectList_){
        let sol; // Needed to calculate offset position
        let sum; //Need to calculate offset position
        let x;
        let y;
        for(var i=0;i<objectList_.length;i++){
            sum=objectList_[i].offSetRadius*2;
            x=relativePosX_ - objectList_[i].relativePosX;
            y=relativePosY_ - objectList_[i].relativePosY;
            sol=Math.sqrt((x*x)+(y*y));
            if(sum>sol){
                return false;
            }
         }
         return true;
        }

    nextLevel(actualPoints_){
        if(this.actualLevel == dificulty.EASY && actualPoints_>levelPoints.MEDIUM){
            this.actualLevel = dificulty.MEDIUM;
            this.actualCutImage = images.obstacle_cut_mid;
            this.actualHitImage = images.obstacle_hit_mid;
            this.actualCutImageDeath = images.obstacle_hit_mid;
            this.stage.changeImg(images.scene_easyToMid,images.scene_mid);
        }
        else if(this.actualLevel == dificulty.MEDIUM && actualPoints_>levelPoints.HARD){
            this.actualLevel = dificulty.HARD;
            this.actualCutImage = images.obstacle_cut_hard;
            this.actualHitImage = images.obstacle_hit_hard;
            this.actualCutImageDeath = images.obstacle_hit_hard;
            this.stage.changeImg(images.scene_midToHard,images.scene_hard);
        }
        else if(this.actualLevel == dificulty.HARD && actualPoints_>levelPoints.HELL){
            this.actualLevel = dificulty.HELL;
            this.actualCutImage = images.obstacle_cut_hell;
            this.actualHitImage = images.obstacle_hit_hell;
            this.actualCutImageDeath = images.obstacle_hit_hell;
            this.stage.changeImg(images.scene_hardToHell,images.scene_hell);
        }
    }
    
    endGame(){
        clearInterval(this.paintInterval);
        clearInterval(this.logicInterval);
        clearInterval(this.obstacleInterval);
        sessionStorage.setItem("ultimaPuntuacion",this.character.points);
        location.href = "gameOver.html";

    }
    
    repaint(){
        //let paintStart = (new Date()).getMilliseconds();//Debug performance
        this.stage.repaint();
        this.character.repaint();
        this.arrayObjects.forEach(function(element) {
            element.repaint();
        });
        /**Debug performance*
    	let oldPaint = this.lastPaint;
    	this.lastPaint = (new Date()).getMilliseconds();
    	console.log("lastPaint: "+this.lastPaint+ " paintIterval: "+(this.lastPaint-oldPaint)+" paintDuration: "+(this.lastPaint-paintStart));//*/
    }
    resizeCanvas( ) {
        this.canvasWidth = 0.985*window.innerWidth;
        this.canvasHeight = 0.985*window.innerHeight;       
        let canvasWidthB = this.canvasHeight/this.aspectRatio;   
        let canvasHeightB = this.canvasWidth*this.aspectRatio;
        if(this.canvasWidth>canvasWidthB)
        {
            this.canvasWidth=Math.floor(canvasWidthB);
            this.canvasHeight=Math.floor(this.canvasHeight);
        }
        else 
        {
            this.canvasHeight=Math.floor(canvasHeightB);
            this.canvasWidth=Math.floor(this.canvasWidth);
        }
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.stage.resize(this.canvasWidth,this.canvasHeight);
        this.character.resize(this.canvasWidth,this.canvasHeight);
        this.arrayObjects.forEach(function(element) {
            console.log("hola");
            element.resize(this.canvasWidth,this.canvasHeight);
        }.bind(this));
        //console.log("resize to w: "+canvas.width + " h: "+canvas.height);
    }
}
