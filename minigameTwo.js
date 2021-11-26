// https://meguta.loca.lt

class HealthBar extends RenderObject {
    constructor (x, y, width, height, maxHealth, scale) {
        super(x, y, width, height, scale)
        this.maxHealth = maxHealth
        this.displayHealth = 0
        this.health = maxHealth

    }
    render () {
        this.events()
        // frame
        g.noStroke()
        let frameWidth = this.width + 2
        let frameHeight = this.height + 2
        g.fill(0, 50, 0)
        g.rect (this.x, this.y, frameWidth, frameHeight, 5)

        // bar
        g.fill(255, 0, 50)
        g.rect(center(this.width, frameWidth)+this.x, center(this.height, frameHeight)+this.y, this.displayHealth*.4, this.height, 5)

    }
    events () {
        // nice transtion
        this.displayHealth = lerp(this.displayHealth, this.health, 0.05)
		if (this.health < 0) {
			this.health = 0
		}
    }
}

class Enemy extends RenderObject {
	constructor (x, y, width, height, e_type=null, scale) {
		super (x, y, width, height, scale)
		this.img = null
		this.type = e_type
		this.inRange = false

		this.startDrag = null
		this.endDrag = null
		this.dragVel = null

		this.drag = false
	}

	move (movement) {
		this.x += movement[0]
		for (let i=0;i<gCollisonRects.length;i++) {
			if (gCollisonRects[i].collison(this)) {
	
				if (movement[0] > 0) {
					this.x = gCollisonRects[i].left - this.width
				}
				if (movement[1] < 0) {
					this.x = gCollisonRects[i].right 
				}
			}
		}
		this.y += movement[1]
		for (let i=0;i<gCollisonRects.length;i++) {
			if (gCollisonRects[i].collison(this)) {
				if (movement[1] > 0) {
					this.y = gCollisonRects[i].top - this.height
				} 
				if (movement[1] < 0) {
					this.y = gCollisonRects[i].bottom
				}
			}
		}
	}
	
	render (draggable) {
		this.load()
		this.events()
		if (this.img != null) {
			g.fill(255)
			g.image(this.img, this.x, this.y)
		}  else {
			if (this.inRange) 
				g.fill((255, 0, 0))
			g.rect(this.x, this.y, this.width, this.height)
		}

	}

	events () {
		// find closest forest and move towards it
		let minIndex = -1
		let minDis = Infinity
		for (let i=0;i<gForests.length;i++){
			if (!gForests[i].isDead){
				let dist = Math.abs(this.x - gForests[i].x) + Math.abs(this.y - gForests[i].y)
				if (minDis > dist) {
					minDis = dist
					minIndex = i
				}
			}

		}
		if (minIndex != -1) {
			let movement =[]
			let dist = Math.abs(this.x - gForests[minIndex].x) + Math.abs(this.y - gForests[minIndex].y)
			movement[0] = lerp(this.x, gForests[minIndex].x, 0.01) - this.x
			movement[1] = lerp(this.y, gForests[minIndex].y, 0.01) - this.y
			this.move(movement)
			if (dist < 50){
				this.inRange = true;
			} else {
				this.inRange = false;
			}

			if (this.inRange) {
				gForests[minIndex].healthBar.health -= 0.1
			}
			
		}

		if (mouseIsPressed /*&& (draggable || this.drag)*/) {
			print("YES")
			if (this.collidepoint(mouseX/this.scale, mouseY/this.scale) || this.drag) {
				if (this.drag == false) {
					this.startDrag = [mouseX/this.scale, mouseY/this.scale, 0]
				} 
				this.drag = true
				this.endDrag = [null, null, 0]
				this.endDrag[2] += 1
				let tempx = ((mouseX-this.width*2)/this.scale) - this.x
				let tempy = ((mouseY-this.height*2)/this.scale) - this.y

				this.move([tempx, tempy])
			}
		} else {
			if (this.drag == true) {
				this.endDrag[0] = mouseX/this.scale
				this.endDrag[1] = mouseY/this.scale

				//print( this.endDrag[0]-this.startDrag[0])

				this.dragVel = [0, 0]
				this.dragVel[0] = ((2*(this.endDrag[0]-this.startDrag[0]) )/ (this.endDrag[2]))/this.scale
				this.dragVel[1] = ((2*(this.endDrag[1]-this.startDrag[1]) )/ (this.endDrag[2]))/this.scale
				this.drag = false

			} else if (this.endDrag != null){
				print(this.dragVel[0], this.dragVel[1])
				if (this.endDrag[2] >= 0) {
					this.move(this.dragVel)
					this.endDrag[2]-=0.5
				}
			}

		}
		

	}

	load () {
		if (this.img==null && this.type !=null) {
			this.img = gImageDatabase[this.type]
		}
	}

	collison (rect1) {
		this.update()
		rect1.update()


		if (rect1==this) {
			print("check 1")
			return false
		}

		if (this.left > rect1.left && this.left < rect1.right) {
			if (this.top < rect1.top && this.top > rect1.bottom) {
				print("collide 1")
				return true
			}
		}

		if (rect1.left > this.left && rect1.left < this.right) {
			if (rect1.top < this.top && rect1.top > this.bottom) {
				print("collide 2")
				return true
			}
		}

		if (this.collidepoint(rect1.left, rect1.top))
			return true
		if (this.collidepoint(rect1.right, rect1.top))
			return true
		if (this.collidepoint(rect1.left, rect1.bottom))
			return true
		if (this.collidepoint(rect1.right, rect1.bottom)){
			print("POO")
			return true

		}

		return false
	}
}

class Forest extends RenderObject {
	constructor (x, y, width, height, e_type=null, scale) {
		super(x, y, width, height, scale)
		this.img = null
		this.type = e_type
        this.healthBar = new HealthBar (x+width, y, 40, 5, 100, 4)
		this.isDead = false
	}

	render () {
        this.load()
		if (this.img !=null) {
			g.image(this.img, this.x, this.y)
		}
		this.healthBar.render()
		if (this.healthBar.health == 0) {
			this.isDead = true
		}
	}
	load () {
		if (this.img==null) {
			this.img = gImageDatabase[this.type]
		}
	}
	collison (rect1) {
		this.update()
		rect1.update()


		if (rect1==this) {
			print("check 1")
			return false
		}

		if (this.left > rect1.left && this.left < rect1.right) {
			if (this.top < rect1.top && this.top > rect1.bottom) {
				print("collide 1")
				return true
			}
		}

		if (rect1.left > this.left && rect1.left < this.right) {
			if (rect1.top < this.top && rect1.top > this.bottom) {
				print("collide 2")
				return true
			}
		}

		if (this.collidepoint(rect1.left, rect1.top))
			return true
		if (this.collidepoint(rect1.right, rect1.top))
			return true
		if (this.collidepoint(rect1.left, rect1.bottom))
			return true
		if (this.collidepoint(rect1.right, rect1.bottom)){
			print("POO")
			return true

		}

		return false
	}
	
}
function preload () {
	gImageDatabase["forest"] = loadImage("data/images/entities/forest.png")
	gImageDatabase["enemy"] = loadImage("data/images/entities/enemy.png")
}

let mean = new Enemy(80, 80, 16, 16, 'enemy', 4)
let gEnemies = [mean]

let furry = new Forest(10, 10, 32, 32, 'forest');
let furry1 = new Forest(10, 100, 32, 32, 'forest');


let gForests = [furry, furry1]

let gCollisonRects = []

function setup() {
    createCanvas(640, 640)
    g = createGraphics (256, 256)
    frameRate(60)
    g.pixelDensity(4)
	for(let i=0; i<20; i++){
		gEnemies.push(new Enemy(80,70, 16, 16, 'enemy', 4))
		gCollisonRects.push(gEnemies[i])
	}
	for (let i=0; i<gForests.length; i++){
		gCollisonRects.push(gForests[i])
	}

}


function draw() {
	p5.disableFriendlyErrors = true
	//print("POOOPOO")
	try {
    	g.noSmooth()
	} catch (e) {}
    g.background('#38d88e')
	for (let i=0;i<gForests.length;i++){
		gForests[i].render()
	}	
	for(let i=0;i<gCollisonRects.length; i++){
		if (gCollisonRects[i].type == 'enemy'){
			gCollisonRects[i].render()
		} else {
			if (gCollisonRects[i].isDead){
				gCollisonRects.splice(i, 1)
			}
		}
	}
    // furry.render()
	// furry1.render()
    scale(4)
    image(g, 0, 0)
}