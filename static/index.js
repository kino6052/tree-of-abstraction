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
    function HierarchyTree(hierarchy) {
        if (hierarchy.hasOwnProperty("name")) {
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        }
        else {
            return;
        }
    }
    HierarchyTree.prototype.buildHierarchyFromObject = function (hierarchy, currentNode) {
        console.log(hierarchy);
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
        return currentNode;
    };
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
var node001 = new HierarchyNode("node001", [
    new HierarchyNode("node002", []),
    new HierarchyNode("node003", [])
]);
var hierarchyTree = new HierarchyTree({
    name: "node001",
    children: [
        {
            name: "node002",
            children: []
        },
        {
            name: "node003",
            children: []
        }
    ]
});
var hierarchyModel = new HierarchyModel(hierarchyTree);
var hierarchyView = new HierarchyView($("#div001"));
var hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
