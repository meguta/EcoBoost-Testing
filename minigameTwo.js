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
        g.fill(150)
        g.rect (this.x, this.y, frameWidth, frameHeight, 5)

        // bar
        g.fill(200)
        g.rect(center(this.width, frameWidth)+this.x, center(this.height, frameHeight)+this.y, this.displayHealth, this.height, 5)

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
	}

	move (movement) {
		this.x += movement[0]
		for (let i=0;i<gForests.length;i++) {
			if (gForests[i].collison(this)) {
				if (movement[0] > 0) {
					this.x = gForests[i].left - this.width
				}
				if (movement[1] < 0) {
					this.x = gForests[i].right 
				}
			}
		}
		this.y += movement[1]
		for (let i=0;i<gForests.length;i++) {
			if (gForests[i].collison(this)) {
				if (movement[1] > 0) {
					this.y = gForests[i].top - this.height
				} 
				if (movement[1] < 0) {
					this.y = gForests[i].bottom
				}
			}
		}
	}
	
	render () {
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
			let dist = Math.abs(this.x - gForests[i].x) + Math.abs(this.y - gForests[i].y)
			if (minDis > dist) {
				minDis = dist
				minIndex = i
			}

		}
		let movement =[]
		let dist = Math.abs(this.x - gForests[minIndex].x) + Math.abs(this.y - gForests[minIndex].y)
		movement[0] = lerp(this.x, gForests[minIndex].x, 0.05) - this.x
		movement[1] = lerp(this.y, gForests[minIndex].y, 0.05) - this.y
		this.move(movement)
		if (dist < 20){
			this.inRange = true;
		} else {
			this.inRange = false;
		}

		if (this.inRange) {
			gForests[minIndex].healthBar.health -= 0.1
		}
		
	}

	load () {
		if (this.img==null && this.type !=null) {
			this.img = gImageDatabase[this.type]
		}
	}
}

class Forest extends RenderObject {
	constructor (x, y, width, height, e_type=null, scale) {
		super(x, y, width, height, scale)
		this.img = null
		this.type = e_type
        this.healthBar = new HealthBar (x+width, y, 100, 10, 100, 4)
	}

	render () {
        this.load()
		if (this.img !=null) {
			g.image(this.img, this.x, this.y)
		}
		this.healthBar.render()
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

		// if (this.x == rect1.x && this.y == rect1.y) {
		// 	print("check 2")
		// 	return true
		// }

		// if (this.x < 0 || this.x > WIDTH-this.width) {
		// 	print("check 3")
		// 	return true
		// }
		// if (this.y < 0 || this.y > HEIGHT-this.height) {
		// 	print("check 4")
		// 	return true
		// }

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
}

function setup() {
    createCanvas(640, 640)
    g = createGraphics (256, 256)
    frameRate(60)
    g.pixelDensity(4)
}

let furry = new Forest(10, 10, 32, 32, 'forest');
let furry1 = new Forest(10, 100, 32, 32, 'forest');

let mean = new Enemy(80, 80, 16, 16, null, 4)

let gForests = [furry, furry1]


function draw() {
	p5.disableFriendlyErrors = true
	//print("POOOPOO")
	try {
    	g.noSmooth()
	} catch (e) {}
    g.background('#38d88e')
	mean.render()
	for(let i=0;i<gForests.length; i++){
		gForests[i].render();
	}
    // furry.render()
	// furry1.render()
    scale(4)
    image(g, 0, 0)
}