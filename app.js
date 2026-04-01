let tasks = [];
function addTask() {
    let input = document.getElementById("tasktext");
    let tasktext = input.value;
    let currentIndex = tasks.length - 1;
   

    if (tasktext === "") {
        return;
    }

    tasks.push(tasktext);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    let taskContainer = document.createElement("div");

    let task = document.createElement("p");
    task.innerText = tasktext; 
    // QUE ""?

    task.onclick = function () {
       if (task.style.textDecoration === "line-through") {
        task.style.textDecoration = "none";
       } else {
        task.style.textDecoration = "line-through";
       }
    };
    

    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "delete";

    deleteBtn.onclick = function () {
    tasks.splice(currentIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskContainer.remove();
    };

    taskContainer.appendChild(task);
    taskContainer.appendChild(deleteBtn);

    document.getElementById("taskList").appendChild(taskContainer);
    input.value = "";
}

//Load data 

let savedTasks = localStorage.getItem("tasks");

if (savedTasks){
    tasks = JSON.parse(savedTasks);

    tasks.forEach(function(tasktext, index) {
    
    let taskContainer = document.createElement("div");

    let task = document.createElement("p");
    task.innerText = tasktext; 
    // QUE ""?

    task.onclick = function () {
       if (task.style.textDecoration === "line-through") {
        task.style.textDecoration = "none";
       } else {
        task.style.textDecoration = "line-through";
       }
    };
    

    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "delete";

    deleteBtn.onclick = function () {
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskContainer.remove();
};

    taskContainer.appendChild(task);
    taskContainer.appendChild(deleteBtn);

    document.getElementById("taskList").appendChild(taskContainer);
    
});
}

