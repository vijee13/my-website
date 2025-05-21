
let nextBtn = document.getElementById("nextBtn");
let prevBtn = document.getElementById("prevBtn");
let allDish = document.querySelectorAll(".dishs");
let searchInput = document.getElementById("searchInput");
let searchBtn = document.getElementById("searchBtn");
let dishValue = document.querySelectorAll(".dishVal");

let count = 0;

const getData = async (value) => {
  try {
    let datas = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${value}`
    );
    let jsonData = await datas.json();

    console.log(jsonData.meals);
    document.querySelector(".showMeal").innerHTML = "";
    jsonData.meals.forEach(function (data) {
      console.log(data);
      let div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <img src=${data.strMealThumb} alt="">
        <p>${data.strMeal}</p>
        <button class="view-more-btn" data-id="${data.idMeal}">View More</button>
      `;
      document.querySelector(".showMeal").appendChild(div);
    });

    // Add event listeners to "View More" buttons
    document.querySelectorAll(".view-more-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mealId = btn.getAttribute("data-id");
        showRecipeDetails(mealId);
      });
    });
  } catch (error) {
    document.querySelector(".showMeal").innerHTML = "<h1>Meal Not Found</h1>";
  }
};

// Show recipe details in modal
const showRecipeDetails = async (mealId) => {
  try {
    let response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    let data = await response.json();
    let meal = data.meals[0];

    document.getElementById("recipeTitle").textContent = meal.strMeal;
    document.getElementById("recipeImg").src = meal.strMealThumb;

    // Ingredients list
    let ingredientsList = document.getElementById("ingredientsList");
    ingredientsList.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
      let ingredient = meal[`strIngredient${i}`];
      let measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        let li = document.createElement("li");
        li.textContent = `${ingredient} - ${measure}`;
        ingredientsList.appendChild(li);
      }
    }

    // Instructions
    document.getElementById("instructions").textContent = meal.strInstructions;

    // Store current meal name for adding to meal plan
    currentMealName = meal.strMeal;

    // Show modal
    let modal = document.getElementById("recipeModal");
    modal.style.display = "block";
  } catch (error) {
    alert("Failed to load recipe details.");
  }
};

let currentMealName = "";

// Add to Meal Plan button functionality
document.getElementById("addToMealPlanBtn").addEventListener("click", () => {
  if (!currentMealName) {
    alert("No recipe selected to add.");
    return;
  }
  let day = prompt(
    "Enter the day to add this meal to (e.g., Monday, Tuesday, etc.):"
  );
  if (!day) {
    return;
  }
  day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  if (!validDays.includes(day)) {
    alert("Invalid day entered. Please enter a valid day of the week.");
    return;
  }
  const plannerDay = Array.from(days).find(
    (d) => d.getAttribute("data-day") === day
  );
  if (!plannerDay) {
    alert("Day not found in planner.");
    return;
  }
  const mealList = plannerDay.querySelector(".meal-list");
  const li = document.createElement("li");
  li.textContent = currentMealName;

  
  

  // Add delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.classList.add("delete-meal-btn");
  delBtn.style.marginLeft = "8px";
  delBtn.addEventListener("click", () => {
    li.remove();
    savePlanner();
  });

  li.appendChild(delBtn);
  mealList.appendChild(li);

  // Auto delete functionality: add event listener to delete button immediately
  delBtn.addEventListener("click", () => {
    li.remove();
    savePlanner();
  });

  // Confirm addition of meal, if cancelled remove meal immediately
  if (!confirm(`Confirm adding "${currentMealName}" to ${day}'s meal plan?`)) {
    li.remove();
    savePlanner();
    return;
  }

  savePlanner();

  alert(`Added "${currentMealName}" to ${day}'s meal plan.`);
});

// Close modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("recipeModal").style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (event) => {
  let modal = document.getElementById("recipeModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

searchBtn.addEventListener("click", function () {
  let searchValue = searchInput.value;
  if (searchValue == "") {
    alert("First Serach Value");
  } else {
    getData(searchValue);
  }
});

dishValue.forEach(function (dishData) {
  dishData.addEventListener("click", function () {
    getData(dishData.value);
  });
});

// slider
allDish.forEach(function (slide, index) {
  slide.style.left = `${index * 100}%`;
});

function myFun() {
  allDish.forEach(function (curVal) {
    curVal.style.transform = `translateX(-${count * 100}%)`;
  });
}

nextBtn.addEventListener("click", function () {
  count++;
  if (count == allDish.length) {
    count = 0;
  }
  myFun();
});

prevBtn.addEventListener("click", function () {
  count--;
  if (count == -1) {
    count = allDish.length - 1;
  }
  myFun();
});

// Weekly Meal Planner Logic
const planner = document.querySelector(".meal-planner");
const days = planner.querySelectorAll(".day");

const loadPlanner = () => {
  let savedPlanner = localStorage.getItem("weeklyMealPlanner");
  if (savedPlanner) {
    let plannerData = JSON.parse(savedPlanner);
    days.forEach((day) => {
      let dayName = day.getAttribute("data-day");
      let mealList = day.querySelector(".meal-list");
      mealList.innerHTML = "";
      if (plannerData[dayName]) {
        plannerData[dayName].forEach((meal) => {
          let li = document.createElement("li");
          li.textContent = meal;
          mealList.appendChild(li);
        });
      }
    });
  }
};

const savePlanner = () => {
  let plannerData = {};
  days.forEach((day) => {
    let dayName = day.getAttribute("data-day");
    let meals = [];
    day.querySelectorAll(".meal-list li").forEach((li) => {
      // Save only the meal name, exclude the "Delete" button text
      let mealName = li.firstChild.textContent || li.textContent;
      meals.push(mealName.trim());
    });
    plannerData[dayName] = meals;
  });
  localStorage.setItem("weeklyMealPlanner", JSON.stringify(plannerData));
};

days.forEach((day) => {
  let addBtn = day.querySelector(".add-meal-btn");
  addBtn.addEventListener("click", () => {
    let mealName = prompt("Enter meal name to add to " + day.getAttribute("data-day"));
    if (mealName) {
      let mealList = day.querySelector(".meal-list");
      let li = document.createElement("li");
      li.textContent = mealName;

      // Add delete button
      let delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.classList.add("delete-meal-btn");
      delBtn.style.marginLeft = "8px";
      delBtn.addEventListener("click", () => {
        li.remove();
        savePlanner();
      });

      li.appendChild(delBtn);
      mealList.appendChild(li);
      savePlanner();
    }
  });

  // Add delete button functionality to existing meals on load
  let mealList = day.querySelector(".meal-list");
  mealList.querySelectorAll("li").forEach((li) => {
    if (!li.querySelector(".delete-meal-btn")) {
      let delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.classList.add("delete-meal-btn");
      delBtn.style.marginLeft = "8px";
      delBtn.addEventListener("click", () => {
        li.remove();
        savePlanner();
      });
      li.appendChild(delBtn);
    }
  });
});

// Load planner on page load
window.addEventListener("load", () => {
  // Clear saved weekly meal planner data on page load to remove unwanted example meals
  localStorage.removeItem("weeklyMealPlanner");
  loadPlanner();
});
