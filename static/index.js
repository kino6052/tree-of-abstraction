var HierarchyController = (function () {
    function HierarchyController(hierarchyModel, hierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    HierarchyController.prototype.display = function () {
        this.hierarchyView.display(this.hierarchyModel);
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
    HierarchyModel.prototype.getHierarchyTreeAsString = function () {
        var result = "";
        return JSON.stringify(this.hierarchyTree);
    };
    HierarchyModel.prototype.getHierarchyTree = function () {
        var result = "";
        this.hierarchyTree.iterate(this.hierarchyTree.hierarchyRoot, function (node) {
            result += " " + node.name + " ";
        });
        return result;
    };
    HierarchyModel.prototype.setHierarchyTree = function (hierarchyTree) {
        this.hierarchyTree = hierarchyTree;
    };
    return HierarchyModel;
}());
var HierarchyView = (function () {
    function HierarchyView(hierarchyWindow) {
        this.hierarchyWindow = hierarchyWindow;
    }
    HierarchyView.prototype.display = function (hierarchyModel) {
        this.hierarchyWindow.html(hierarchyModel.getHierarchyTree());
    };
    return HierarchyView;
}());
var HierarchyTree = (function () {
    function HierarchyTree(hierarchyRoot) {
        this.hierarchyRoot = hierarchyRoot;
    }
    HierarchyTree.prototype.iterate = function (currentNode, callback) {
        if (currentNode) {
            callback(currentNode);
            for (var _i = 0, _a = currentNode.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                this.iterate(childNode, callback);
            }
        }
        else {
            return;
        }
    };
    return HierarchyTree;
}());
var HierarchyNode = (function () {
    function HierarchyNode(name, children) {
        this.name = name;
        this.children = children;
    }
    return HierarchyNode;
}());
var node001 = new HierarchyNode("node001", []);
var hierarchyTree = new HierarchyTree(node001);
var hierarchyModel = new HierarchyModel(hierarchyTree);
var hierarchyView = new HierarchyView($("#div001"));
var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
