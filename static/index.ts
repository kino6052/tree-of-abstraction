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

let generateUniqueHashId = function(){
    return Math.random().toString(16).replace(".", "") + new Date().getTime().toString(16);
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
    collapseNode(nodeId:String){
        this.hierarchyModel.collapseNode(nodeId);
        this.display();
    }
    edit(nodeId:String){
        this.hierarchyView.edit(nodeId, this);
    }
    updatenodeId(nodeId:String, newnodeId:String){
        this.hierarchyModel.updatenodeId(nodeId, newnodeId);
        this.display();
    }
    add(nodeId:String){
        this.hierarchyModel.add(new HierarchyNode("New Node", []), nodeId:String);
        this.display();
    }
    remove(nodeId:String){
        this.hierarchyModel.remove(nodeId:String);
        this.display();
    }
}

// class HierarchyModel {
//     HierarchyModel: HierarchyModel
//     constructor(HierarchyModel: HierarchyModel){
//         this.HierarchyModel = HierarchyModel;
//     }
//     getHierarchyModelAsObject(){
//         return this.HierarchyModel;
//     }
//     setHierarchyModel(HierarchyModel: HierarchyModel){
//         this.HierarchyModel = HierarchyModel;
//     }
//     toggleNode(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         HierarchyModel.toggleNode(nodeId);
//     }
//     showChildren(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = this.findNode(nodeId);
//         HierarchyModel.showChildren(node);
//     }
//     hideChildren(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = this.findNode(nodeId);
//         HierarchyModel.hideChildren(node);
//     }
//     findNode(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = HierarchyModel.findNode(HierarchyModel.hierarchyRoot, nodeId);
//         return node;
//     }
//     collapseNode(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         HierarchyModel.collapseNode(nodeId);  
//     }
//     updatenodeId(nodeId:String, newnodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = HierarchyModel.findNode(HierarchyModel.hierarchyRoot, nodeId);
//         node.name = newnodeId;
//     }
//     add(newNode:HierarchyNode, nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = HierarchyModel.findNode(HierarchyModel.hierarchyRoot, nodeId);
//         node.children.unshift(newNode);
//     }
//     remove(nodeId:String){
//         let HierarchyModel = this.HierarchyModel;
//         let node = HierarchyModel.removeNode(HierarchyModel.hierarchyRoot, nodeId);
//     }
// }

class HierarchyView {
    hierarchyController: HierarchyController
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    
    displayHierarchyModelHTML(hierarchyModel:HierarchyModel){
        let result = "";
        let previousIndentAmount = 0;
        let hierarchyModel = hierarchyModel.getHierarchyModelAsObject();
        hierarchyModel.iterate(
            hierarchyModel.hierarchyRoot, 
            (node: HierarchyNode, indentAmount: Number) => {
                if (indentAmount > previousIndentAmount){
                    // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                        result += "<ul>";
                    // }
                } else 
                if (indentAmount < previousIndentAmount){
                    for (let i = 0; i < previousIndentAmount - indentAmount; i++){ // UL tags must match indentation levels
                        result += "</ul>";
                    }
                }
                previousIndentAmount = indentAmount;
                result += this.displayNodeHTML(node);
            },
            previousIndentAmount
        );
        for (let i = 0; i < previousIndentAmount; i++){
            result += "</ul>";
        }
        return "<ul>" + result + "</ul>";
    }
    
    displayNodeHTML(node: HierarchyNode){
        if (node.visible){
            return ""                                                                                   +
            "<li>"                                                                                      +
                "<div class='node' id='"+node.id+"' style='font-weight: bold;'>"      + 
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
        this.hierarchyWindow.html(this.displayHierarchyModelHTML(hierarchyModel));
    }
    
    initLogic(hierarchyController: HierarchyController){
        $(".collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.collapseNode(nodeId);
        })
        $(".edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.edit(nodeId);
        })
        $(".add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.add(nodeId);
        })
        $(".remove").on("click", (e)=>{
            let nodeId = $(e.currentTarget).siblings(".node")[0].id;
            hierarchyController.remove(nodeId);
        })
    }
    
    edit(nodeId: String, hierarchyController: HierarchyController){
        let node = $(".node#" + nodeId);
        $("#" + nodeId).html("<input placeholder='" + node.text() + "'><button class='save'>Save</button><button class='cancel'>Cancel</button>");
        node.find(".cancel").on("click", ()=>{
            hierarchyController.display();
        });
        node.find(".save").on("click", ()=>{
            let newnodeId = node.find("input").val();
            hierarchyController.updatenodeId(nodeId, newnodeId);
            hierarchyController.display();
        });
    }
}

class HierarchyModel {
    hierarchyRoot: HierarchyNode
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
    }
    getHierarchyModelAsObject(){
        return this;
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
    
    findNode(currentNode: HierarchyNode, nodeId: String){
        if (toLowerSerpent(currentNode.id) === toLowerSerpent(nodeId)) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.findNode(childNode, nodeId);
                if (resultNode && toLowerSerpent(resultNode.id) === toLowerSerpent(nodeId)){
                    return resultNode;
                }
            }
            return resultNode;
        }
    }
    
    removeNode(currentNode: HierarchyNode, nodeId: String){
        if (currentNode.id === nodeId) {
            let resultNodeIndex = currentNode.children.indexOf(resultNode);
            currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.removeNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId){
                    let resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
                }
            }
            return resultNode;
        }
    }
    
    add(newNode:HierarchyNode, nodeId:String){
        console.log(nodeId);
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.children.unshift(newNode);
    }
    
    remove(nodeId:String){
        let node = this.removeNode(this.hierarchyRoot, nodeId);
    }
    
    collapseNode(nodeId: String){
        let nodeToCollapse = this.findNode(this.hierarchyRoot, nodeId);
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
    id: string
    visible: Boolean
    children: Array<HierarchyNode>
    collapsed: Boolean
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.id = generateUniqueHashId();
        this.children = children;
        this.visible = true;
        this.collapsed = false;
    }
}

let hierarchyModel = new HierarchyModel(
    {
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: [
            {
                name: "node002",
                id: generateUniqueHashId(),
                collapsed: false,
                visible: true,
                children: [
                    {
                        name: "node004",
                        id: generateUniqueHashId(),
                        collapsed: false,
                        visible: true,
                        children: []
                    }    
                ]
            },
            {
                name: "node003",
                id: generateUniqueHashId(),
                collapsed: false,
                visible: true,
                children: []
            }
        ]
    }
)
let hierarchyView = new HierarchyView($("#div001"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);

// Node Unit Tests
exports.MODEL_JsonToTreeTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyNode = new HierarchyNode("node001", []);
    test.notEqual(hierarchyModel.hierarchyRoot.id, hierarchyNode.id);
    hierarchyModel.hierarchyRoot.id = "";
    hierarchyNode.id = "";
    test.deepEqual(hierarchyModel.hierarchyRoot, hierarchyNode);
    test.done();
};

exports.MODEL_AddTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    test.deepEqual(newNode, hierarchyModel.hierarchyRoot.children[0]);
    test.done();
}

exports.MODEL_RemoveTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    hierarchyModel.remove(newNode.id); // TODO: Change Node Name to Unique ID!
    test.deepEqual(0, hierarchyModel.hierarchyRoot.children.length);
    test.done();
}

exports.MODEL_UniqueHashIdTest = function(test){
    test.done();
}

// exports.MODEL_HideChildren = function(test) {
//     let HierarchyModel = new HierarchyModel({
//         name: "node001",
//         collapsed: false,
//         visible: true,
//         children: []
//     });
//     let hierarchyModel = new HierarchyModel(HierarchyModel);
//     let newNode = new HierarchyNode("node002", []);
//     hierarchyModel.add(newNode, "node001");
//     hierarchyModel.remove("node002"); // TODO: Change Node Name to Unique ID!
//     test.deepEqual(0, hierarchyModel.HierarchyModel.hierarchyRoot.children.length);
//     test.done();
// }

exports.VIEW_JsonToDOMTreeTest = function(test) {
    var nodeId001 = "";
    var nodeId002 = "";
    var nodeId003 = "";
    var nodeId004 = "";
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    nodeId001 = hierarchyModel.hierarchyRoot.id;
    let html = "";
    let hierarchyView = new HierarchyView($());
    html = "<ul>"                                                                   +
                "<li>"                                                              +
                    "<div class='node' id='"+nodeId001+"' style='font-weight: bold;'>"    + 
                        "node001"                                                   + 
                    "</div>"                                                        +
                    "<span class='collapse'> collapse </span>|"                     + 
                    "<span class='edit'> edit </span>|"                             + 
                    "<span class='add'> add </span>|"                               + 
                    "<span class='remove'> remove </span>"                          + 
                "</li>"                                                             +  
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node002 = new HierarchyNode("node002", []);
    nodeId002 = node002.id;
    hierarchyModel.add(node002, nodeId001);
    html = "<ul>"                                                                       +
                "<li>"                                                                  +
                    "<div class='node' id='"+nodeId001+"' style='font-weight: bold;'>"        + 
                        "node001"                                                       + 
                    "</div>"                                                            +
                    "<span class='collapse'> collapse </span>|"                         + 
                    "<span class='edit'> edit </span>|"                                 + 
                    "<span class='add'> add </span>|"                                   + 
                    "<span class='remove'> remove </span>"                              + 
                "</li>"                                                                 +     
                "<ul>"                                                                  +
                    "<li>"                                                              +
                        "<div class='node' id='"+nodeId002+"' style='font-weight: bold;'>"    + 
                            "node002"                                                   + 
                        "</div>"                                                        +
                        "<span class='collapse'> collapse </span>|"                     + 
                        "<span class='edit'> edit </span>|"                             + 
                        "<span class='add'> add </span>|"                               + 
                        "<span class='remove'> remove </span>"                          + 
                    "</li>"                                                             +  
                "</ul>"                                                                 +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node003 = new HierarchyNode("node003", []);
    nodeId003 = node003.id;
    hierarchyModel.add(node003, nodeId002);
    html = "<ul>"                                                                           +
                "<li>"                                                                      +
                    "<div class='node' id='"+nodeId001+"' style='font-weight: bold;'>"            + 
                        "node001"                                                           + 
                    "</div>"                                                                +
                    "<span class='collapse'> collapse </span>|"                             + 
                    "<span class='edit'> edit </span>|"                                     + 
                    "<span class='add'> add </span>|"                                       + 
                    "<span class='remove'> remove </span>"                                  + 
                "</li>"                                                                     +     
                "<ul>"                                                                      +
                    "<li>"                                                                  +
                        "<div class='node' id='"+nodeId002+"' style='font-weight: bold;'>"        + 
                            "node002"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +  
                    "<ul>"                                                                  +
                        "<li>"                                                              +
                            "<div class='node' id='"+nodeId003+"' style='font-weight: bold;'>"    + 
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
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node004 = new HierarchyNode("node004", []);
    nodeId004 = node004.id;
    hierarchyModel.add(node004, nodeId001);
    html = "<ul>"                                                                           +
                "<li>"                                                                      +
                    "<div class='node' id='"+nodeId001+"' style='font-weight: bold;'>"            + 
                        "node001"                                                           + 
                    "</div>"                                                                +
                    "<span class='collapse'> collapse </span>|"                             + 
                    "<span class='edit'> edit </span>|"                                     + 
                    "<span class='add'> add </span>|"                                       + 
                    "<span class='remove'> remove </span>"                                  + 
                "</li>"                                                                     +     
                "<ul>"                                                                      +
                    "<li>"                                                                  +
                        "<div class='node' id='"+nodeId004+"' style='font-weight: bold;'>"        + 
                            "node004"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +
                    "<li>"                                                                  +
                        "<div class='node' id='"+nodeId002+"' style='font-weight: bold;'>"        + 
                            "node002"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +  
                    "<ul>"                                                                  +
                        "<li>"                                                              +
                            "<div class='node' id='"+nodeId003+"' style='font-weight: bold;'>"    + 
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
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    hierarchyModel.remove(nodeId004);
    html = "<ul>"                                                                           +
                "<li>"                                                                      +
                    "<div class='node' id='"+nodeId001+"' style='font-weight: bold;'>"            + 
                        "node001"                                                           + 
                    "</div>"                                                                +
                    "<span class='collapse'> collapse </span>|"                             + 
                    "<span class='edit'> edit </span>|"                                     + 
                    "<span class='add'> add </span>|"                                       + 
                    "<span class='remove'> remove </span>"                                  + 
                "</li>"                                                                     +     
                "<ul>"                                                                      +
                    "<li>"                                                                  +
                        "<div class='node' id='"+nodeId002+"' style='font-weight: bold;'>"        + 
                            "node002"                                                       + 
                        "</div>"                                                            +
                        "<span class='collapse'> collapse </span>|"                         + 
                        "<span class='edit'> edit </span>|"                                 + 
                        "<span class='add'> add </span>|"                                   + 
                        "<span class='remove'> remove </span>"                              + 
                    "</li>"                                                                 +  
                    "<ul>"                                                                  +
                        "<li>"                                                              +
                            "<div class='node' id='"+nodeId003+"' style='font-weight: bold;'>"    + 
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
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
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