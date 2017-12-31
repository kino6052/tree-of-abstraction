var $ = $ || function () {
    return {
        html: function () {
            return;
        },
        on: function () {
            return;
        }
    };
};
var toLowerSerpent = function (input) {
    return input.toLowerCase().split(" ").join("-");
};
var HierarchyController = (function () {
    function HierarchyController(hierarchyModel, hierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    HierarchyController.prototype.display = function () {
        this.hierarchyView.display(this.hierarchyModel);
        this.hierarchyView.initLogic(this);
    };
    HierarchyController.prototype.collapseNode = function (nodeName) {
        this.hierarchyModel.collapseNode(nodeName);
        this.display();
    };
    HierarchyController.prototype.edit = function (nodeName) {
        this.hierarchyView.edit(nodeName, this);
    };
    HierarchyController.prototype.updateNodeName = function (nodeName, newNodeName) {
        this.hierarchyModel.updateNodeName(nodeName, newNodeName);
        this.display();
    };
    HierarchyController.prototype.add = function (nodeName) {
        this.hierarchyModel.add(nodeName, String);
        this.display();
    };
    HierarchyController.prototype.remove = function (nodeName) {
        this.hierarchyModel.remove(nodeName, String);
        this.display();
    };
    return HierarchyController;
}());
var HierarchyModel = (function () {
    function HierarchyModel(hierarchyTree) {
        this.hierarchyTree = hierarchyTree;
    }
    HierarchyModel.prototype.getHierarchyTreeAsObject = function () {
        return this.hierarchyTree;
    };
    HierarchyModel.prototype.setHierarchyTree = function (hierarchyTree) {
        this.hierarchyTree = hierarchyTree;
    };
    HierarchyModel.prototype.toggleNode = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        hierarchyTree.toggleNode(nodeName);
    };
    HierarchyModel.prototype.showChildren = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = this.findNode(nodeName);
        hierarchyTree.showChildren(node);
    };
    HierarchyModel.prototype.hideChildren = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = this.findNode(nodeName);
        hierarchyTree.hideChildren(node);
    };
    HierarchyModel.prototype.findNode = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        return node;
    };
    HierarchyModel.prototype.collapseNode = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        hierarchyTree.collapseNode(nodeName);
    };
    HierarchyModel.prototype.updateNodeName = function (nodeName, newNodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        node.name = newNodeName;
    };
    HierarchyModel.prototype.add = function (newNode, nodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        node.children.unshift(newNode);
    };
    HierarchyModel.prototype.remove = function (nodeName) {
        var hierarchyTree = this.hierarchyTree;
        var node = hierarchyTree.removeNode(hierarchyTree.hierarchyRoot, nodeName);
    };
    return HierarchyModel;
}());
var HierarchyView = (function () {
    function HierarchyView(hierarchyWindow) {
        this.hierarchyWindow = hierarchyWindow;
    }
    HierarchyView.prototype.displayHierarchyTreeHTML = function (hierarchyModel) {
        var _this = this;
        var result = "";
        var previousIndentAmount = 0;
        var hierarchyTree = hierarchyModel.getHierarchyTreeAsObject();
        hierarchyTree.iterate(hierarchyTree.hierarchyRoot, function (node, indentAmount) {
            if (indentAmount > previousIndentAmount) {
                // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                result += "<ul>";
            }
            else if (indentAmount < previousIndentAmount) {
                // for (let i = 0; i < previousIndentAmount - indentAmount; i++){ // UL tags must match indentation levels
                result += "</ul>";
            }
            previousIndentAmount = indentAmount;
            result += _this.displayNodeHTML(node);
        }, previousIndentAmount);
        if (previousIndentAmount > 0) {
            for (var i = 0; i < previousIndentAmount; i++) {
                result += "</ul>";
            }
        }
        return "<ul>" + result + "</ul>";
    };
    HierarchyView.prototype.displayNodeHTML = function (node) {
        if (node.visible) {
            return "" +
                "<li>" +
                "<div class='node' id='" + toLowerSerpent(node.name) + "' style='font-weight: bold;'>" +
                node.name +
                "</div>" +
                "<span class='collapse'> collapse </span>|" +
                "<span class='edit'> edit </span>|" +
                "<span class='add'> add </span>|" +
                "<span class='remove'> remove </span>" +
                "</li>";
        }
        else {
            return "";
        }
    };
    HierarchyView.prototype.display = function (hierarchyModel) {
        this.hierarchyWindow.html(this.displayHierarchyTreeHTML(hierarchyModel));
    };
    HierarchyView.prototype.initLogic = function (hierarchyController) {
        $(".collapse").on("click", function (e) {
            var nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.collapseNode(nodeName);
        });
        $(".edit").on("click", function (e) {
            var nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.edit(nodeName);
        });
        $(".add").on("click", function (e) {
            var nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.add(nodeName);
        });
        $(".remove").on("click", function (e) {
            var nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.remove(nodeName);
        });
    };
    HierarchyView.prototype.edit = function (nodeName, hierarchyController) {
        var node = $(".node#" + nodeName);
        $("#" + nodeName).html("<input placeholder='" + node.text() + "'><button class='save'>Save</button><button class='cancel'>Cancel</button>");
        node.find(".cancel").on("click", function () {
            hierarchyController.display();
        });
        node.find(".save").on("click", function () {
            var newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeName, newNodeName);
            hierarchyController.display();
        });
    };
    return HierarchyView;
}());
var HierarchyTree = (function () {
    function HierarchyTree(hierarchy) {
        if (hierarchy.hasOwnProperty("name")) {
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        }
        else {
            return;
        }
    }
    HierarchyTree.prototype.buildHierarchyFromObject = function (hierarchy, currentNode) {
        var childNode = null;
        if (hierarchy.hasOwnProperty("name")) {
            currentNode.name = hierarchy.name;
        }
        else {
            return null;
        }
        if (hierarchy.hasOwnProperty("children")) {
            for (var child in hierarchy.children) {
                childNode = this.buildHierarchyFromObject(hierarchy.children[child], new HierarchyNode("", []));
                if (childNode) {
                    currentNode.children.push(childNode);
                }
            }
        }
        if (hierarchy.hasOwnProperty("visible")) {
            currentNode.visible = hierarchy.visible;
        }
        if (hierarchy.hasOwnProperty("collapsed")) {
            currentNode.collapsed = hierarchy.collapsed;
        }
        return currentNode;
    };
    HierarchyTree.prototype.iterate = function (currentNode, callback, indentAmount) {
        if (currentNode) {
            callback(currentNode, indentAmount);
            indentAmount++;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                this.iterate(childNode, callback, indentAmount);
            }
        }
        else {
            return;
        }
    };
    HierarchyTree.prototype.toggleNode = function (node) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    };
    HierarchyTree.prototype.hideChildren = function (parent) {
        for (var _i = 0, _a = parent.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            childNode.visible = false;
            this.hideChildren(childNode);
        }
    };
    HierarchyTree.prototype.showChildren = function (parent) {
        for (var _i = 0, _a = parent.children; _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (!parent.collapsed && parent.visible) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    };
    HierarchyTree.prototype.findNode = function (currentNode, nodeName) {
        if (toLowerSerpent(currentNode.name) === toLowerSerpent(nodeName)) {
            return currentNode;
        }
        else {
            var resultNode = null;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                resultNode = this.findNode(childNode, nodeName);
                if (resultNode && toLowerSerpent(resultNode.name) === toLowerSerpent(nodeName)) {
                    return resultNode;
                }
            }
            return resultNode;
        }
    };
    HierarchyTree.prototype.removeNode = function (currentNode, nodeName) {
        if (currentNode.name === nodeName) {
            return currentNode;
        }
        else {
            var resultNode = null;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                resultNode = this.removeNode(childNode, nodeName);
                if (resultNode && resultNode.name === nodeName) {
                    var resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex + 1);
                }
            }
            return resultNode;
        }
    };
    HierarchyTree.prototype.collapseNode = function (nodeName) {
        var nodeToCollapse = this.findNode(this.hierarchyRoot, nodeName);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed) {
            this.hideChildren(nodeToCollapse);
        }
        else {
            this.showChildren(nodeToCollapse);
        }
    };
    return HierarchyTree;
}());
var HierarchyNode = (function () {
    function HierarchyNode(name, children) {
        this.name = name;
        this.children = children;
        this.visible = true;
        this.collapsed = false;
    }
    return HierarchyNode;
}());
var hierarchyTree = new HierarchyTree({
    name: "node001",
    collapsed: false,
    visible: true,
    children: [
        {
            name: "node002",
            collapsed: false,
            visible: true,
            children: [
                {
                    name: "node004",
                    collapsed: false,
                    visible: true,
                    children: []
                }
            ]
        },
        {
            name: "node003",
            collapsed: false,
            visible: true,
            children: []
        }
    ]
});
var hierarchyModel = new HierarchyModel(hierarchyTree);
var hierarchyView = new HierarchyView($("#div001"));
var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
// Node Unit Tests
exports.MODEL_JsonToTreeTest = function (test) {
    var hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    var hierarchyNode = new HierarchyNode("node001", []);
    test.deepEqual(hierarchyTree.hierarchyRoot, hierarchyNode);
    test.done();
};
exports.VIEW_JsonToDOMTreeTest = function (test) {
    var hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    var html = "";
    var hierarchyView = new HierarchyView($());
    var hierarchyModel = new HierarchyModel(hierarchyTree);
    html = "<ul>" +
        "<li>" +
        "<div class='node' id='node001' style='font-weight: bold;'>" +
        "node001" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node002", []), "node001");
    html = "<ul>" +
        "<li>" +
        "<div class='node' id='node001' style='font-weight: bold;'>" +
        "node001" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<ul>" +
        "<li>" +
        "<div class='node' id='node002' style='font-weight: bold;'>" +
        "node002" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node003", []), "node002");
    html = "<ul>" +
        "<li>" +
        "<div class='node' id='node001' style='font-weight: bold;'>" +
        "node001" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<ul>" +
        "<li>" +
        "<div class='node' id='node002' style='font-weight: bold;'>" +
        "node002" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<ul>" +
        "<li>" +
        "<div class='node' id='node003' style='font-weight: bold;'>" +
        "node003" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "</ul>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node004", []), "node001");
    html = "<ul>" +
        "<li>" +
        "<div class='node' id='node001' style='font-weight: bold;'>" +
        "node001" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<ul>" +
        "<li>" +
        "<div class='node' id='node004' style='font-weight: bold;'>" +
        "node004" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<li>" +
        "<div class='node' id='node002' style='font-weight: bold;'>" +
        "node002" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "<ul>" +
        "<li>" +
        "<div class='node' id='node003' style='font-weight: bold;'>" +
        "node003" +
        "</div>" +
        "<span class='collapse'> collapse </span>|" +
        "<span class='edit'> edit </span>|" +
        "<span class='add'> add </span>|" +
        "<span class='remove'> remove </span>" +
        "</li>" +
        "</ul>" +
        "</ul>" +
        "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    test.done();
};
exports.AUX_ToLowerSerpentTest = function (test) {
    var input;
    var result;
    input = "Test Test Test";
    result = toLowerSerpent(input);
    input = "ChChEcK-Test";
    result = toLowerSerpent(input);
    test.equals("chcheck-test", result);
    input = "c  c  c";
    result = toLowerSerpent(input);
    test.equals("c--c--c", result); // Should It Be Like This?
    test.done();
};
