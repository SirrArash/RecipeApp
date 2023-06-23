const searchIconEl = document.querySelector(".icon"),
  logoEl = document.querySelector(".logoImage"),
  inputEl = document.querySelector("#mysearch"),
  clearEl = document.querySelector(".clear"),
  mealsEl = document.getElementById("meals"),
  favEL = document.getElementById("fav-meals"),
  mealPopUpEl = document.getElementById("meal-popup"),
  mealInfoBtnEl = document.getElementById("close-popup"),
  mealInfoEl = document.getElementById("meal-info"),
  searchEl = document.querySelector(".search");

let imgStatus = 0;

searchIconEl.addEventListener("click", () => {
  searchEl.classList.toggle("active");
  inputEl.value = "";

  logoEl.src = "./Images/icon2.png";
  console.log(imgStatus);
  if (imgStatus === 0) {
    logoEl.src = "./Images/icon2.png";
    logoEl.className = "logoImageAlt";
    // logoEl.classList.toggle("active");
    imgStatus = 1;
  } else {
    logoEl.src = "./Images/logo.png";
    imgStatus = 0;
    logoEl.className = "logoImage";
  }
});

clearEl.addEventListener("click", () => {
  inputEl.value = "";
  // location.reload();
});

getRandomMeal();
fetchFavMeals();

// --------------- random meal from api ------------------
async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  console.log(respData);
  addMeal(randomMeal, true);
}
// --------------- random meal from api by id ------------------
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal-container");

  meal.innerHTML = `
        <div class="meal-header">
        ${random ? `<span class="random"> Random Reciep </span>` : ``}
        
        <img
          src="${mealData.strMealThumb}"
          alt="${mealData.strMeal}"
        />
      </div>
      <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn"><i class="fas fa-heart"></i></button>
      </div>
    `;
  mealsEl.appendChild(meal);

  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favEL.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addMealFav(meal);
  }
}

function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
          <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
          />
          <span>${mealData.strMeal}</span>
          <button class="clearBtn"><i class="fa-solid fa-xmark"></i></button>
    `;

  const btn = favMeal.querySelector(".clearBtn");

  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favEL.appendChild(favMeal);
}

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  // update the Meal info
  const mealEl = document.createElement("div");

  const ingredients = [];

  // get ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
        <button class="close-popup" id="close-popup" onclick="document.getElementById('meal-popup').classList.add('hidden')">
        <i class="fa-solid fa-xmark"></i>
        </button>
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
              .map(
                (ing) => `
            <li>${ing}</li>
            `
              )
              .join("")}
        </ul>
    `;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopUpEl.classList.remove("hidden");
}

inputEl.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    // clean container
    mealsEl.innerHTML = "";

    const search = inputEl.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
      meals.forEach((meal) => {
        addMeal(meal);
      });
    }
  }
});

// mealInfoBtnEl.addEventListener("click", () => {
//   mealPopUpEl.classList.add("hidden");
// });
