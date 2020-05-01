// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return {
        addItem : function(type, des, val) {

            var newItem, ID;

            //! [1 2 3 4 5], next ID = 6
            //! [1 2 4 6 8], next ID = 9
            //! ID = last ID + 1
            
            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;

        },
        
        deleteItem : function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget : function() {

            //TODO 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //TODO 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //TODO 3. Calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages : function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget : function() {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing : function() {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };

    var formatNumber = function(num, type) {

        var numSplit, int, dec;

        /*
        ! + or - before a number
        ! exactly 2 decimal points
        ! comma separating the thousands

        ! 2310.4567 -> 2,310.46
        !  2000 -> + 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            var i, j, k;

            i = int.length % 3;
            j = 0; 
            k = '';

            if(i === 0) {
                i=3;
            }

            do {
                k += int.substr(j, i) + ',';
                j += i;
                i = 3;
            } while(j < int.length-3);
            k += int.substr(j, i);

            int = k;
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+')  + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for(var i=0; i<list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // Get Input Values
        getInput : function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value,  //! Will be either inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };
        },

        addListItem : function(obj, type) {

            var html, newHtml, element;

            //TODO 1. Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            //TODO 2. Replace the placceholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //TODO 3. Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function() {
            
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget : function(obj) {

            var type;

            type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages : function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });

        },

        displayDate : function() {
            var now, year, months, month;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = months[now.getMonth()];
            
            document.querySelector(DOMstrings.dateLabel).textContent = month + ', ' + year;
        },

        changedType : function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings : function() {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, uiCtrl) {

    var setupEventListeners = function() {

        var DOM = uiCtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);

    };

    var updateBudget = function() {

        var budget;

        //TODO 1. Calculate the budget
        budgetCtrl.calculateBudget();

        //TODO 2. Return the budget
        budget = budgetCtrl.getBudget();

        //TODO 3. Display the budget on the UI
        uiCtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        //TODO 1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        //TODO 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //TODO 3. Update the UI with the new percentages
        uiCtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {

        var input, newItem;

        //TODO 1. Get the field input data
        input = uiCtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value>0 && input.value<=1e9) {
            //TODO 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //TODO 3. Add the item to the UI
            uiCtrl.addListItem(newItem, input.type);

            //TODO 4. Clear the fields
            uiCtrl.clearFields();

            //TODO 5. Calculate and update the budget
            updateBudget();

            //TODO 6. Calculate anbd update percentages
            updatePercentages();
        } else {
            uiCtrl.clearFields();
        }

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            //! inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //TODO 1. Delete the item form the data structure
            budgetCtrl.deleteItem(type, ID);

            //TODO 2. Delete the item from the UI
            uiCtrl.deleteListItem(itemID);

            //TODO 3. Update and show the new budget
            updateBudget();

             //TODO 4. Calculate anbd update percentages
            updatePercentages();
        }

    };

    return {
        init : function() {
            console.log('Application Started !');
            uiCtrl.displayDate();
            uiCtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();