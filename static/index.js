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
    HierarchyController.prototype.toggleNode = function (nodeId) {
        var hierarchyRoot = this.hierarchyModel.hierarchyTree.hierarchyRoot;
        this.hierarchyModel.toggleNode(this.hierarchyModel.findNode(nodeId));
        this.display();
    };
    HierarchyController.prototype.collapseNode = function (nodeId) {
        console.log("here");
        var hierarchyRoot = this.hierarchyModel.hierarchyTree.hierarchyRoot;
        var nodeToCollapse = this.hierarchyModel.findNode(nodeId);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed) {
            this.hierarchyModel.hideChildren(nodeToCollapse);
        }
        else {
            this.hierarchyModel.showChildren(nodeToCollapse);
        }
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
    HierarchyModel.prototype.toggleNode = function (nodeId) {
        var hierarchyTree = this.hierarchyTree;
        hierarchyTree.toggleNode(nodeId);
    };
    HierarchyModel.prototype.showChildren = function (nodeId) {
        var hierarchyTree = this.hierarchyTree;
        hierarchyTree.showChildren(nodeId);
    };
    HierarchyModel.prototype.hideChildren = function (nodeId) {
        var hierarchyTree = this.hierarchyTree;
        hierarchyTree.hideChildren(nodeId);
    };
    HierarchyModel.prototype.findNode = function (nodeId) {
        var hierarchyTree = this.hierarchyTree;
        var node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeId);
        return node;
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
                result += "<ul>";
            }
            else if (indentAmount < previousIndentAmount) {
                result += "</ul>";
            }
            previousIndentAmount = indentAmount;
            result += _this.displayNodeHTML(node);
        }, previousIndentAmount);
        return "<ul>" + result + "</ul>";
    };
    HierarchyView.prototype.displayNodeHTML = function (node) {
        if (node.visible) {
            return "<li><div class='node' id='" + node.name + "' style='width: 100%; height: 50px; border: 1px dashed black;'>" + node.name + " <span class='collapse'>x</span></div></li>";
        }
        else {
            return "";
        }
    };
    HierarchyView.prototype.display = function (hierarchyModel) {
        this.hierarchyWindow.html(this.displayHierarchyTreeHTML(hierarchyModel));
    };
    HierarchyView.prototype.initLogic = function (hierarchyController) {
        $(".node .collapse").on("click", function (e) {
            var nodeId = $(e.currentTarget).parent(".node")[0].id;
            hierarchyController.collapseNode(nodeId);
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
            if (!parent.collapsed) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    };
    HierarchyTree.prototype.findNode = function (currentNode, nodeId) {
        if (currentNode.name === nodeId) {
            return currentNode;
        }
        else {
            var resultNode = null;
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                resultNode = this.findNode(childNode, nodeId);
                if (resultNode && resultNode.name === nodeId) {
                    return resultNode;
                }
            }
            return resultNode;
        }
    };
    return HierarchyTree;
}());
var HierarchyNode = (function () {
    function HierarchyNode(name, children, visible, collapsed) {
        this.name = name;
        this.children = children;
        this.visible = visible;
        this.collapsed = collapsed;
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
