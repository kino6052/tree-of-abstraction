let $ = $ || function(){
    return {
        html: function(){
            return;
        },
        on: function(){
            return;
        }
    }
};

let toLowerSerpent = function(input: String){
    return input.toLowerCase().split(" ").join("-");
}

class HierarchyController {
    hierarchyModel: HierarchyModel
    hierarchyView: HierarchyView
    constructor(hierarchyModel: HierarchyModel, hierarchyView: HierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    display(){
        this.hierarchyView.display(this.hierarchyModel);
        this.hierarchyView.initLogic(this);
    }
    collapseNode(nodeName:String){
        this.hierarchyModel.collapseNode(nodeName);
        this.display();
    }
    edit(nodeName:String){
        this.hierarchyView.edit(nodeName, this);
    }
    updateNodeName(nodeName:String, newNodeName:String){
        this.hierarchyModel.updateNodeName(nodeName, newNodeName);
        this.display();
    }
    add(nodeName:String){
        this.hierarchyModel.add(nodeName:String);
        this.display();
    }
    remove(nodeName:String){
        this.hierarchyModel.remove(nodeName:String);
        this.display();
    }
}

class HierarchyModel {
    hierarchyTree: HierarchyTree
    constructor(hierarchyTree: HierarchyTree){
        this.hierarchyTree = hierarchyTree;
    }
    getHierarchyTreeAsObject(){
        return this.hierarchyTree;
    }
    setHierarchyTree(hierarchyTree: HierarchyTree){
        this.hierarchyTree = hierarchyTree;
    }
    toggleNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        hierarchyTree.toggleNode(nodeName);
    }
    showChildren(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = this.findNode(nodeName);
        hierarchyTree.showChildren(node);
    }
    hideChildren(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = this.findNode(nodeName);
        hierarchyTree.hideChildren(node);
    }
    findNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        return node;
    }
    collapseNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        hierarchyTree.collapseNode(nodeName);  
    }
    updateNodeName(nodeName:String, newNodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        node.name = newNodeName;
    }
    add(newNode:HierarchyNode, nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        node.children.unshift(newNode);
    }
    remove(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.removeNode(hierarchyTree.hierarchyRoot, nodeName);
    }
}

class HierarchyView {
    hierarchyController: HierarchyController
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    
    displayHierarchyTreeHTML(hierarchyModel:HierarchyModel){
        let result = "";
        let previousIndentAmount = 0;
        let hierarchyTree = hierarchyModel.getHierarchyTreeAsObject();
        hierarchyTree.iterate(
            hierarchyTree.hierarchyRoot, 
            (node: HierarchyNode, indentAmount: Number) => {
                if (indentAmount > previousIndentAmount){
                    // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                        result += "<ul>";
                    // }
                } else 
                if (indentAmount < previousIndentAmount){
                    // for (let i = 0; i < previousIndentAmount - indentAmount; i++){ // UL tags must match indentation levels
                        result += "</ul>";
                    // }
                }
                previousIndentAmount = indentAmount;
                result += this.displayNodeHTML(node);
            },
            previousIndentAmount
        );
        if (previousIndentAmount > 0) {
            for (let i = 0; i < previousIndentAmount; i++){
                result += "</ul>";
            }
        } 
        return "<ul>" + result + "</ul>";
    }
    
    displayNodeHTML(node: HierarchyNode){
        if (node.visible){
            return ""                                                                                   +
            "<li>"                                                                                      +
                "<div class='node' id='"+toLowerSerpent(node.name)+"' style='font-weight: bold;'>"      + 
                    node.name                                                                           + 
                "</div>"                                                                                +
                "<span class='collapse'> collapse </span>|"                                             + 
                "<span class='edit'> edit </span>|"                                                     + 
                "<span class='add'> add </span>|"                                                       + 
                "<span class='remove'> remove </span>"                                                  + 
            "</li>"
        } else {
            return "";
        }
    }
    
    display(hierarchyModel: HierarchyModel){
        this.hierarchyWindow.html(this.displayHierarchyTreeHTML(hierarchyModel));
    }
    
    initLogic(hierarchyController: HierarchyController){
        $(".collapse").on("click", (e)=>{
            let nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.collapseNode(nodeName);
        })
        $(".edit").on("click", (e)=>{
            let nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.edit(nodeName);
        })
        $(".add").on("click", (e)=>{
            let nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.add(nodeName);
        })
        $(".remove").on("click", (e)=>{
            let nodeName = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.remove(nodeName);
        })
    }
    
    edit(nodeName: String, hierarchyController: HierarchyController){
        let node = $(".node#" + nodeName);
        $("#" + nodeName).html("<input placeholder='" + node.text() + "'><button class='save'>Save</button><button class='cancel'>Cancel</button>");
        node.find(".cancel").on("click", ()=>{
            hierarchyController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeName, newNodeName);
            hierarchyController.display();
        });
    }
}

class HierarchyTree {
    hierarchyRoot: HierarchyNode
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
    }
    
    buildHierarchyFromObject(hierarchy: Object, currentNode: HierarchyNode){
        let childNode = null;
        if (hierarchy.hasOwnProperty("name")){
            currentNode.name = hierarchy.name;
        } else {
            return null;
        }
        if (hierarchy.hasOwnProperty("children")){
            for (let child in hierarchy.children){
                childNode = this.buildHierarchyFromObject(
                    hierarchy.children[child], 
                    new HierarchyNode("",[])
                )
                if (childNode){
                    currentNode.children.push(childNode);
                }
            }
        }
        if (hierarchy.hasOwnProperty("visible")){
            currentNode.visible = hierarchy.visible;
        }
        if (hierarchy.hasOwnProperty("collapsed")){
            currentNode.collapsed = hierarchy.collapsed;
        }
        return currentNode;
    }
    
    iterate(currentNode: HierarchyNode, callback: Function, indentAmount: Number){
        if (currentNode){
            callback(currentNode, indentAmount);
            indentAmount++;
            for (let childNode of currentNode.children){
                this.iterate(childNode, callback, indentAmount);
            }    
        } else {
            return
        }
    }
    
    toggleNode(node: HierarchyNode){
        for (let childNode of node.children){
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    }
    
    hideChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            childNode.visible = false;
            this.hideChildren(childNode);
        }
    }
    
    showChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            if (!parent.collapsed && parent.visible) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    }
    
    findNode(currentNode: HierarchyNode, nodeName: String){
        if (toLowerSerpent(currentNode.name) === toLowerSerpent(nodeName)) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.findNode(childNode, nodeName);
                if (resultNode && toLowerSerpent(resultNode.name) === toLowerSerpent(nodeName)){
                    return resultNode;
                }
            }
            return resultNode;
        }
    }
    
    removeNode(currentNode: HierarchyNode, nodeName: String){
        if (currentNode.name === nodeName) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.removeNode(childNode, nodeName);
                if (resultNode && resultNode.name === nodeName){
                    let resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
                }
            }
            return resultNode;
        }
    }
    
    collapseNode(nodeName: String){
        let nodeToCollapse = this.findNode(this.hierarchyRoot, nodeName);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed){
            this.hideChildren(nodeToCollapse);
        } else {
            this.showChildren(nodeToCollapse);
        }
    }
}

class HierarchyNode {
    name: string
    visible: Boolean
    children: Array<HierarchyNode>
    collapsed: Boolean
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.children = children;
        this.visible = true;
        this.collapsed = false;
    }
}

let hierarchyTree = new HierarchyTree(
    {
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
    }
)

let hierarchyModel = new HierarchyModel(hierarchyTree);
let hierarchyView = new HierarchyView($("#div001"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);

// Node Unit Tests
exports.MODEL_JsonToTreeTest = function(test) {
    let hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyNode = new HierarchyNode("node001", []);
    test.deepEqual(hierarchyTree.hierarchyRoot, hierarchyNode);
    test.done();
};

exports.MODEL_AddTest = function(test) {
    let hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyModel = new HierarchyModel(hierarchyTree);
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, "node001");
    test.deepEqual(newNode, hierarchyModel.hierarchyTree.hierarchyRoot.children[0]);
    test.done();
}

exports.MODEL_RemoveTest = function(test) {
    let hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyModel = new HierarchyModel(hierarchyTree);
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, "node001");
    hierarchyModel.remove("node002"); // TODO: Change Node Name to Unique ID!
    test.deepEqual(0, hierarchyModel.hierarchyTree.hierarchyRoot.children.length);
    test.done();
}

exports.VIEW_JsonToDOMTreeTest = function(test) {
    let hierarchyTree = new HierarchyTree({
        name: "node001",
        collapsed: false,
        visible: true,
        children: []
    });
    let html = "";
    let hierarchyView = new HierarchyView($());
    let hierarchyModel = new HierarchyModel(hierarchyTree);
    html = "<ul>"                                                                   +
                "<li>"                                                              +
                    "<div class='node' id='node001' style='font-weight: bold;'>"    + 
                        "node001"                                                   + 
                    "</div>"                                                        +
                    "<span class='collapse'> collapse </span>|"                     + 
                    "<span class='edit'> edit </span>|"                             + 
                    "<span class='add'> add </span>|"                               + 
                    "<span class='remove'> remove </span>"                          + 
                "</li>"                                                             +  
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node002", []), "node001");
    html = "<ul>"                                                                       +
                "<li>"                                                                  +
                    "<div class='node' id='node001' style='font-weight: bold;'>"        + 
                        "node001"                                                       + 
                    "</div>"                                                            +
                    "<span class='collapse'> collapse </span>|"                         + 
                    "<span class='edit'> edit </span>|"                                 + 
                    "<span class='add'> add </span>|"                                   + 
                    "<span class='remove'> remove </span>"                              + 
                "</li>"                                                                 +     
                "<ul>"                                                                  +
                    "<li>"                                                              +
                        "<div class='node' id='node002' style='font-weight: bold;'>"    + 
                            "node002"                                                   + 
                        "</div>"                                                        +
                        "<span class='collapse'> collapse </span>|"                     + 
                        "<span class='edit'> edit </span>|"                             + 
                        "<span class='add'> add </span>|"                               + 
                        "<span class='remove'> remove </span>"                          + 
                    "</li>"                                                             +  
                "</ul>"                                                                 +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node003", []), "node002");
    html = "<ul>"                                                                           +
                "<li>"                                                                      +
                    "<div class='node' id='node001' style='font-weight: bold;'>"            + 
                        "node001"                                                           + 
                    "</div>"                                                                +
                    "<span class='collapse'> collapse </span>|"                             + 
                    "<span class='edit'> edit </span>|"                                     + 
                    "<span class='add'> add </span>|"                                       + 
                    "<span class='remove'> remove </span>"                                  + 
                "</li>"                                                                     +     
                "<ul>"                                                                      +
                    "<li>"                                                                  +
                        "<div class='node' id='node002' style='font-weight: bold;'>"        + 
                            "node002"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +  
                    "<ul>"                                                                  +
                        "<li>"                                                              +
                            "<div class='node' id='node003' style='font-weight: bold;'>"    + 
                                "node003"                                                   + 
                            "</div>"                                                        +
                            "<span class='collapse'> collapse </span>|"                     + 
                            "<span class='edit'> edit </span>|"                             + 
                            "<span class='add'> add </span>|"                               + 
                            "<span class='remove'> remove </span>"                          + 
                        "</li>"                                                             +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    hierarchyModel.add(new HierarchyNode("node004", []), "node001");
    html = "<ul>"                                                                           +
                "<li>"                                                                      +
                    "<div class='node' id='node001' style='font-weight: bold;'>"            + 
                        "node001"                                                           + 
                    "</div>"                                                                +
                    "<span class='collapse'> collapse </span>|"                             + 
                    "<span class='edit'> edit </span>|"                                     + 
                    "<span class='add'> add </span>|"                                       + 
                    "<span class='remove'> remove </span>"                                  + 
                "</li>"                                                                     +     
                "<ul>"                                                                      +
                    "<li>"                                                                  +
                        "<div class='node' id='node004' style='font-weight: bold;'>"        + 
                            "node004"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +
                    "<li>"                                                                  +
                        "<div class='node' id='node002' style='font-weight: bold;'>"        + 
                            "node002"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +  
                    "<ul>"                                                                  +
                        "<li>"                                                              +
                            "<div class='node' id='node003' style='font-weight: bold;'>"    + 
                                "node003"                                                   + 
                            "</div>"                                                        +
                            "<span class='collapse'> collapse </span>|"                     + 
                            "<span class='edit'> edit </span>|"                             + 
                            "<span class='add'> add </span>|"                               + 
                            "<span class='remove'> remove </span>"                          + 
                        "</li>"                                                             +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyTreeHTML(hierarchyModel));
    test.done();
};

exports.AUX_ToLowerSerpentTest = function(test) {
    let input;
    let result;
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