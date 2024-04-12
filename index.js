const userTab=document.querySelector("[data-user]");
const searchTab=document.querySelector("[data-search]");

// STARTING VRBL WITH INITIAL CONDITIONS 
let currentTab=userTab;  
const API_KEY= "17a822025a3511197b3327d3a7a432b4";
currentTab.classList.add("current-tab-clss");

// IF WE CLICKED ON ANY TAB 
userTab.addEventListener("click",() => {
    switchTab(userTab);
});
searchTab.addEventListener("click",() => {
    switchTab(searchTab);
});

const container=document.querySelector(".container");  // pure ki 
const searchForm=document.querySelector("[data-search-place]"); 
const grant=document.querySelector(".grantcontainer");   // for grant ui
const search=document.querySelector("[data-search-place]");
const load=document.querySelector(".loader");
const userinfo=document.querySelector(".user-info");
grant.classList.add("active");

function switchTab(newTab){
    if(newTab!=currentTab){
        currentTab.classList.remove("current-tab-clss");  // add or emove when you want to change bg clr
        currentTab=newTab;
        currentTab.classList.add("current-tab-clss");

        if(!searchForm.classList.contains("active")){   // if srchform not contain active class means yeh invbsl hain then you want to make it visible  aur at this time u clicked on srch thats why u here bec 24 line condtn chck hui hain ki diff tab hain 
            searchForm.classList.add("active");
            userinfo.classList.remove("active");
            grant.classList.remove("active");
              // vohi wali add bakiremove aur kyu dikhani 
            // search.classList.add("active");
            
        }
        else{ // intially on search tab now want to move on user tab
            // grant.classList.add("active");
            searchForm.classList.remove("active");
            userinfo.classList.remove("active");

            // visible own loc.. weather deatils 
            // 1st need to find own coordinates 
            findcoord();
        }
    }
}

function findcoord(){
    // 1st check ki coord..alrdy prsnt hain yha nhi if hain then use else get 
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){ // agr nhi hain coord means abi grant access wali cheej hogi aur uspe click krke milenge so grant wali window show
        grant.classList.add("active");
    }
    else{ // agr hain toh then use it and call API using long, lat 
        const coordinates= JSON.parse(localCoordinates); // parse se kuch nhi local coord hain voh string json hain use json object me convert bs 
        fetchuserweatherinfo(coordinates);
    }

}

async function fetchuserweatherinfo(coordinates){ // API call then funcn -> aysnc
    // api call jaa rhi hain so time to show loader 
    const {lat,lon}=coordinates;  
    console.log('Coordinates:', lat, lon); 
    grant.classList.remove("active");
    load.classList.add("active");

    // call API
    try{
        console.log('Before fetch API call');
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        // const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=25.2048&lon=55.2708&appid=17a822025a3511197b3327d3a7a432b4`);
        const data = await response.json();  // data me aa gya object saari inf kaa 
        load.classList.remove("active");
        userinfo.classList.add("active");

        renderfunc(data); // data me se joh chayie voh milega
    }
    catch(err){
        load.classList.remove("active");
        console.error('Error fetching weather information:', err);
    }
}

// how to access data from weather Api object data 
// we have to fetch the elements like temp, icon chnage krne k e liye 

// we can access particular prop from json object { eske andr aur bi json object = nested json object} through OPTIONAL CHAINING OPERATOR (?.)
// if voh prop exist nhi then yeh oprtr not throw any err it give undefined vl
// obj={name:"yash" , adrss:{city:"delhi , state:"de;hi }}
// obj?.adrrss?.state

function renderfunc(data){
    
    const city= document.querySelector("[cityname]");
    const flag= document.querySelector("[cityflag]");
    const weathertext= document.querySelector("[weather-text]");
    const weatherimg= document.querySelector("[weather-img]");
    const t = document.querySelector("[temp]");
    const windspeed = document.querySelector("[windspeed-value]");
    const humidity = document.querySelector("[humidity-value]");
    const clouds = document.querySelector("[clouds-value]");

    // fetch all details from data using chaining operator
    city.innerText =data?.name;
    flag.src =`https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weathertext.innerText =data?.weather?.[0]?.description;  // data me weather ek array tha 
    weatherimg.src =`http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;


    let temperature = data?.main?.temp;
    if (temperature > 273) {
        // Convert temperature from Kelvin to Celsius
        temperature -= 273.19;
        t.innerText = `${temperature.toFixed(2)} °C`;
    } else {
        // Display temperature in Kelvin
        t.innerText = `${temperature} °C`;
    }

    // t.innerText =`${data?.main?.temp} °C`;


    windspeed.innerText =`${data?.wind?.speed} m/s`;
    humidity.innerText =`${data?.main?.humidity}%`;
    clouds.innerText =`${data?.clouds?.all}%`;
}

//agar coord nhi hain phele se toh lane pi pdenge  by adding event lsitner on grant accss buttn ki click hote getloc wala funcn call and then use add yha set krva dena then use it 

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition); // esme callbck function use showposition ->fucn
    }
    else{
        // grantAccessButton.style.display = 'none';
    }

}

function showPosition(position){ // position ek object hain 

    const userCoordinates={
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchuserweatherinfo(userCoordinates);
}

const grantbuttn = document.querySelector("[grant-buttn]");
grantbuttn.addEventListener("click",getLocation);

const searchInput =document.querySelector("[data-search-it]");

searchForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")return;
    else{
        fetchsearchweatherinfo(cityName);
    }
});

async function fetchsearchweatherinfo(city){
    load.classList.add("active");
    userinfo.classList.remove("active");
    grant.classList.remove("active");
    

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);   // await is imp...without it you can't get o/p bec fetch se phele o/p dene ki try
        const data = await response.json();
        load.classList.remove("active");
        userinfo.classList.add("active");
        renderfunc(data);
    }
    catch(err){
        console.error('Error fetching weather information:', err);   // no err 
        load.classList.remove('active');
        userinfo.classList.remove('active');
    }
}