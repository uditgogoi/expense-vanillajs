// budget controller
var budgetController = (function () {
      var Expense = function (id, description, value, ) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1
      }

      Expense.prototype.calcPercentage = function (totalIncome) {
            if (totalIncome > 0) {
                  this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                  this.percentage = -1;
            }
      }
      Expense.prototype.getPercentage = function () {
            return this.percentage;
      }

      var Income = function (id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
      }

      var calulateBudget = function (type) {
            var sum = 0;
            data.allItems[type].forEach((val) => {
                  sum += val.value
            })
            data.totals[type] = sum;
      }

      var data = {
            allItems: {
                  exp: [],
                  inc: []
            },
            totals: {
                  exp: 0,
                  inc: 0
            },
            budget: 0,
            percentage: -1
      }


      return {

            // ()=>  adding items
            addItem: function (type, des, val) {

                  var newItem, ID;

                  //calculate ID
                  if (data.allItems[type].length > 0) {
                        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                  } else {
                        ID = 0
                  }

                  // add data 
                  if (type === 'exp') {
                        newItem = new Expense(ID, des, val)
                  }
                  else {
                        newItem = new Income(ID, des, val)
                  }
                  data.allItems[type].push(newItem)
                  return newItem
            },

            //()=> get budget
            getBudget: function () {
                  return {
                        budget: data.budget,
                        totalIncome: data.totals.inc,
                        totalExpense: data.totals.exp,
                        percentage: data.percentage
                  };
            },

            // ()=> get all added items
            getAllItems: function () {
                  return data
            },

            //()=> delete item
            deteItem: function (type, id) {
                  var ids, index;

                  ids = data.allItems[type].map(function (current) {
                        return current.id
                  })

                  index = ids.indexOf(id);

                  if (index !== -1) {
                        data.allItems[type].splice(index, 1)
                  }

            },


            // ()=> update budget
            calculateBudget: function () {
                  // calculate total income and expense
                  calulateBudget('exp');
                  calulateBudget('inc');

                  // calculate budget
                  data.budget = data.totals.inc - data.totals.exp;

                  // calculate percentage
                  if (data.totals.inc > 0)
                        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            },

            calculatePercentage: function () {
                  data.allItems.exp.forEach(function (cur) {
                        cur.calcPercentage(data.totals.inc);
                  })
            },

            getPercentages: function () {
                  var allPerc = data.allItems.exp.map(function (cur) {
                        return cur.getPercentage();
                  })
                  return allPerc;
            },
      }

})()


// UI controller
var UIController = (function () {

      return {
            // ()=> get the inputs
            getInput: function () {
                  return {
                        type: document.querySelector('.add__type').value,
                        description: document.querySelector('.add__description').value,
                        value: parseFloat(document.querySelector('.add__value').value),
                  }
            },

            // ()=> add list items to UI 
            addListItems: function (obj, type) {
                  var html, newHtml, element;
                  // create HTML tags with placeholder text

                  if (type === 'inc') {
                        // income
                        element = '.income__list'
                        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"> <div class="item__value">+ %val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

                  } else if (type === 'exp') {
                        // expense
                        element = '.expenses__list'
                        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"> <div class="item__value">-  %val%</div><div class="item__percentage">%perc%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                  }

                  newHtml = html.replace('%id%', obj.id);
                  newHtml = newHtml.replace('%desc%', obj.description);
                  newHtml = newHtml.replace('%val%', obj.value);
                  // newHtml = newHtml.replace('%perc%', obj.percentage);

                  document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


            },
            deleteListItem: function (selectorID) {
                  var el = document.getElementById(selectorID);
                  el.parentNode.removeChild(el);
            },

            // ()=> clear all inputs 
            clearAllInputs: function () {
                  var fields, fieldsArray;
                  fields = document.querySelectorAll('.add__description,.add__value')
                  fieldsArray = Array.prototype.slice.call(fields)

                  fieldsArray.forEach(function (current, index, array) {
                        current.value = "";
                  });
                  fieldsArray[0].focus();
            },
            displayBudget: function (obj) {
                  document.querySelector(".budget__value").textContent = obj.budget;
                  document.querySelector(".budget__income--value").textContent = obj.totalIncome;
                  document.querySelector(".budget__expenses--value").textContent = obj.totalExpense;

                  if (obj.percentage > 0) {
                        document.querySelector(".budget__expenses--percentage").textContent = obj.percentage + "%";
                  }
                  else {
                        document.querySelector(".budget__expenses--percentage").textContent = "--";

                  }

            },
            displayPercentages: function (percentages) {
                  var fields = document.querySelectorAll(".item__percentage");

                  var nodeListForEach = function (list, callback) {
                        for (let i = 0; i < list.length; i++) {
                              callback(list[i], i)
                        }
                  }

                  nodeListForEach(fields, function (current, index) {
                        if (percentages[index] > 0) {
                              current.textContent = percentages[index] + '%'
                        } else {
                              current.textContent= '---'
                        }
                  })
            }
      }
})()


// main app controller
var controller = (function (budgetCtr, UICtr) {

      var setEventListener = function () {
            document.querySelector('.add__btn').addEventListener('click', ctrAddItems);
            document.addEventListener('keypress', function (event) {
                  if (event.keyCode === 13)
                        ctrAddItems();
            });

            document.querySelector(".container").addEventListener("click", ctrDeleteItem)
      }

      var updateBudget = function () {
            // calculate the budget
            budgetCtr.calculateBudget()

            // return the budget
            var budget = budgetCtr.getBudget()

            // display the budget
            UICtr.displayBudget(budget)
      }

      var updatePercentages = function () {
            // calculate percentage
            budgetCtr.calculatePercentage();

            // read percentage from budget controller
            var percentages = budgetCtr.getPercentages();

            // update UI
            UICtr.displayPercentages(percentages);
      }

      var ctrAddItems = function () {
            // get the field input data
            var input = UICtr.getInput()
            // check if input is empty
            if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

                  //add the item to budget controller
                  var items = budgetCtr.addItem(input.type, input.description, input.value);

                  //add item to the UI for display
                  UIController.addListItems(items, input.type);

                  //clear the fields
                  UICtr.clearAllInputs();

                  //update budget
                  updateBudget();

                  // calc percentages
                  updatePercentages();
            }
      }

      var ctrDeleteItem = function (event) {
            var itemID, splitID, type, ID;
            itemID = event.target.parentNode.parentNode.parentNode.id;
            if (itemID) {
                  splitID = itemID.split("-");
                  type = splitID[0];
                  ID = parseInt(splitID[1]);
                  //delete item from DS
                  budgetCtr.deteItem(type, ID);

                  // delete item from UI
                  UICtr.deleteListItem(itemID)


                  // update totals in budget
                  updateBudget();

                  // calc percentages
                  updatePercentages();
            }
      }

      return {
            init: function () {
                  setEventListener();
                  UICtr.displayBudget({
                        budget: '',
                        totalIncome: '',
                        totalExpense: '',
                        percentage: ''
                  })
            }
      }




})(budgetController, UIController)

controller.init();