var BudgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value/totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

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

  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach((item) => {
      sum = sum + item.value;
    });

    data.totals[type] = sum;
  }

  return {
    addItem: function(type, desc, val) {
      var newItem;
      var id = 0;

      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      if (type === 'inc') {
        newItem = new Income(id, desc, val);
      } else if (type === 'exp') {
        newItem = new Expense(id, desc, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the precentage of income that we spent
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
      
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(item) {
        item.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(item) {
        return item.getPercentage();
      });

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    deleteItem: function(type, id) {
      var ids = data.allItems[type].map(function(item) {
        return item.id;
      });

      var index = ids.indexOf(id);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    testing: function() {
      console.log(data);
    }
  };

})();

var UIController = (function() {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, sign;
    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    sign = type === 'exp' ? '-' : '+';

    return sign +  ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for(let i = 0; i < list.length; i ++) {
      callback(list[i], i);
    }
  };

  return {

    getDOMStrings: function() {
      return DOMStrings;
    },

    getInput: function() {
      var type = document.querySelector(DOMStrings.inputType).value;
      var description = document.querySelector(DOMStrings.inputDescription).value;
      var value = document.querySelector(DOMStrings.inputValue).value;

      return {
        type: type,
        description: description,
        value: parseFloat(value)
      };
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(element => {
        element.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, 'inc');
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, type);
     

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

      nodeListForEach(fields, function(item, index) {
        if (percentages [index] > 0) {
          item.textContent = percentages[index] + '%';
        } else {
          item.textContent = '---';
        }
        
      });

    },

    displayMonth: function() {
      var year, month;
      var months = ['Jan', 'Feb', ' Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var now = new Date();

      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' +  year;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create html string with placeholder text
      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
      } else {
        element = DOMStrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage"></div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`
      }
      // Replace the placeholder text with some actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insert element to the UI
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    removeListItem: function(selectorId) {
      var element = document.getElementById(selectorId);

      element.parentNode.removeChild(element);
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ', ' + 
        DOMStrings.inputDescription + ', ' +
        DOMStrings.inputValue
      );

      nodeListForEach(fields, function(item) {
        item.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputButton).classList.toggle('red');
    }
    
  };

})();

var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change',  UICtrl.changedType);
  }

  var updateBudget = function() {
    var budget;

    // Calculate the budget
    budgetCtrl.calculateBudget();
    // Return the budget
    budget = budgetCtrl.getBudget();
    // Display the budget on UI
    UICtrl.displayBudget(budget);
  }

  var updatePercentages = function() {
     budgetCtrl.calculatePercentages();

     var percentages = budgetCtrl.getPercentages();
     console.log(percentages);

     UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get the field input data
    input = UICtrl.getInput();
    
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      console.log(budgetCtrl.testing());
      //3. Add the item to UI
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      
      // 4. Calculate and update budget
      updateBudget();

      // Update percentages
      updatePercentages();
    }
  }

  var ctrlDeleteItem = function(event) {
    var splitId, type, id;
    var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split('-');
      type = splitId[0];
      id = splitId[1];

      // Delete the item from data structure
      budgetCtrl.deleteItem(type, parseInt(id));

      // Delete item from UI
      UICtrl.removeListItem(itemId);
      /// Update and show the budget
      updateBudget();

      updatePercentages();
    }
  }

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalExp: 0,
        totalInc: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }
  
})(BudgetController, UIController);

controller.init();