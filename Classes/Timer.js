class Timer extends RenderObject {
	constructor (x,y,width,height,scale) {
		super(x, y, width, height, scale)
		this.clock = new Clock(10, 60)
		this.fade = 0
	}
	render () {
		this.clock.update()

		this.hover()

		g.textSize(10)
		g.fill('#f2ff66')
		g.image(gImageDatabase['timerframe'], this.x, this.y)
		
		let temp = this.clock.format()
		let tWidth = g.textWidth(temp)

		g.textAlign(CENTER);
		g.text(this.clock.format(), center(tWidth, this.width)+this.x, center(10, this.height)+this.y-5, tWidth, this.height)
		tWidth = g.textWidth(this.getScore())
		g.fill('#00BE91')
		g.text(this.getScore(), center(tWidth, this.width)+this.x, center(10, this.height)+this.y+5, tWidth, this.height)

		if (this.gGameOver()) {
			this.fade = lerp(this.fade, 150, 0.05)
			g.background(0, this.fade)
			g.fill('#00BE91')
			tWidth = g.textWidth("You got: " + this.getScore() + " points!")
			g.text("You got: " + this.getScore() + " points!", center(tWidth, this.width)+this.x, center(10, HEIGHT), tWidth, this.height)

			g.fill('#f2ff66')
			tWidth = g.textWidth("Game Over!")
			g.text("Game Over!", center(tWidth, this.width)+this.x, center(10, HEIGHT)-15, 100, 50)
			gGameOver = true

			if (this.fade > 149) {
				window.location.href = "minigameTwo.html"
			}
		}
	}
	hover () {
		this.update()
		if (this.collidepoint(mouseX/this.scale, mouseY/this.scale) && !gGameOver) {
			this.y = lerp(this.y, 0, 0.05)
		
		} else {
			this.y = lerp(this.y, -28, 0.05)
		}
	}
	getScore() {
		let type1 =0;
		let type2 =0;
		let type3 =0;

		try {
			for (let i=0;i<rects.length;i++){
				if(rects[i].type=="flower1"){
					type1+= 1
		
				} else if(rects[i].type=="flower2"){
					type2+=1
				} else {
					type3+=1
				}
			}
			let bonusPoints = min(type3, min(type1, type2))
			let totalPoints = bonusPoints*15 + (type1)*10 + (type2)*10 + (type3)*10
			return totalPoints
		} catch (e) {
			return 0
		}

	}

	gGameOver() {
		if (this.clock.time == 0){	
			return true 
		}
	}

}