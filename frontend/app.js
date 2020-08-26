

const app = new Vue({
    el: "#app",
    data: {
        loggedin: false,
        JWT: "",
        loginUN: "",
        loginPW: "",
        createUN: "",
        createPW: "",
        devURL: "http://localhost:3000",
        prodURL: null,
        activities: [],
        token: '',
        activities: [],
        onAccount: false,
        favoriteActivities: [],
        clicked: false
    },

    methods: {
        //////////// LOGIN /////////////
        handleLogin: function(event){
            event.preventDefault()
            const URL = this.prodURL ? this.prodURL : this.devURL
            // console.log(URL) //if you click login and it gives you URL it works
            const user = {username: this.loginUN, password: this.loginPW}
            console.log(user) //if you type in username and password and see it in the console it works
            fetch(`${URL}/login`, {
                method: "post", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error)
                    alert('Error logging in. Please try again.')
                } else {
                    this.user = data.user
                    this.token = data.token
                    this.loggedin = true
                    this.loginUN = "" //resets: clears out when you log in
                    this.loginPW = "" //resets: clears out when you log in
                }
            })
            
        },

        //////////// LOG OUT /////////////
        handleLogout: function() {
            const URL = this.prodURL ? this.prodURL : this.devURL
            this.loggedin = false 
            this.user = null
            this.token = null
        },


        //////////// CREATE USER /////////////
        handleSignup: function(){
            const URL = this.prodURL ? this.prodURL : this.devURL
            const user = {
                username: this.createUN,
                password: this.createPW
            }
            fetch(`${URL}/users`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.error){
                        alert('Sign up unsuccessful')
                    } else {
                        alert('Sign up successful')
                        this.createPW = ""
                        this.createUN = ""
                    }
                })
        },

        //////////// GETTING ACTIVITY INFO FROM DB /////////////
        // requires event bc we are waiting for an on click on the button
        handleActivities: async function(event){
            const URL = this.prodURL ? this.prodURL : this.devURL
            const id = event.target.id
            console.log(id)
            console.log(URL)

            fetch(`${URL}/activities/q/${id}`, {
                method: "get",
                headers: {
                    Authorization: `bearer ${this.token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                    // for(i = 0; i < data.data.length; i ++){
                    //    data.data[i].className = "fas fa-heart"
                    // } //made the hearts
                    this.activities = data.data 
                    console.log(data.data)
                    console.log(`${URL}/activities/q/${id}`)
                })
                console.log(this.activities.length);
                for(i = 0; i < this.activities.length; i ++){
                    const fav = await fetch(`${URL}/favorites/${this.activities[i].id}`, {
                        method: "get",
                        headers: {
                            Authorization: `bearer ${this.token}`
                        }
                    })
                    const booly = await fav.json() //omg i have to await this im literally on the floor
                    console.log(booly);
                    !!(booly) ? Vue.set(this.activities[i], "className", "fas fa-heart" ) : Vue.set(this.activities[i], "className", "far fa-heart" )
                     
                 }
        },

        toggleFav: function(event){
            const URL = this.prodURL ? this.prodURL : this.devURL
            const actId = event.target.getAttribute("act_id")
            fetch(`${URL}/favorites/${actId}`, {
                method: "post",
                headers: {
                    Authorization: `bearer ${this.token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.activities.filter(a=>a.id == actId)[0].className = data.status ? "fas fa-heart" : "far fa-heart"
                })
            console.log()
        },
        //////////// TAKES USER TO THE ACCOUNT PG /////////////
        ////// When the user is taken to their account page, they will automatically see a list of all their favorites
        goToAccount: function(event){
            const URL = this.prodURL ? this.prodURL : this.devURL
            // console.log(URL)
            this.onAccount = true

            fetch(`${URL}/favorites/`, {
                method: "get",
                headers: {
                    Authorization: `bearer ${this.token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.favoriteActivities = data.data
                    console.log(data.data)
                    console.log(`${URL}/favorites`)
                })
        },

        toggleAccountButton: function(event){
            if (!this.clicked){
                $("#acct-btn").text("My Account")
                // $(".option").text("THIS IS ON")
                this.onAccount = false
            } else {
                $("#acct-btn").text("Dashboard")
                // $(".option").text("THIS IS OFF")
                this.onAccount = true
            }
            this.clicked = !this.clicked
           }
        }
})

/////////////////////////////////////////////////////////////////////////////////////////////

// ==NAV BAR ONLY==

let firstDiv = $(".navbar").append('<div class ="brand-title"><img class="logo" src="https://res.cloudinary.com/techhire/image/upload/v1598408188/travel-logo_bmeebn.png"></div>')
let firstAttr = $(".navbar").append('<a href ="#" class="toggle-button"><span class="bar"></span> <span class="bar"></span> <span class="bar"></span> </a>')
let secondDiv = $(".navbar").append('<div class="navbar-links"><ul><li><a class="aaa" href="#pageCoverPhoto">Learn More</a></li><li><a class="aaa" href="#products">Help</a></li><li><a class="aaa" href="#contact">About</a></li></ul></div>')

const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})
// ==NAV BAR ONLY end ==


// ==Moved Functions
console.log(app)

const handleActivities = async function(event){
    const URL = app._data.prodURL ? app._data.prodURL : app._data.devURL
    const id = event.target.id
    console.log(id)
    console.log(URL)
    console.log(app._data.token)

    const f = await fetch(`${URL}/activities/q/${id}`, {
        method: "get",
        headers: {
            Authorization: `bearer ${app._data.token}`
        }
    })

    const data = await f.json()
    app._data.activities = data.data 
    await handleFavs()
}

async function handleFavs(){
    const URL = app._data.prodURL ? app._data.prodURL : app._data.devURL
    for(i = 0; i < app.activities.length; i++){
        const fav = await fetch(`${URL}/favorites/${app.activities[i].id}`, {
            method: "get",
            headers: {
                Authorization: `bearer ${app.token}`
            }
        })
        console.log(fav)
        const booly = await fav.json()

        console.log(booly);
        booly ? Vue.set(app.activities[i], "className", "fas fa-heart" ) : Vue.set(app.activities[i], "className", "far fa-heart" )
         
     }
}