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
    getHierarchyTreeAsString(){
        let result = "";
        return JSON.stringify(this.hierarchyTree);
    }
    getHierarchyTree(){
        let result = "";
        this.hierarchyTree.iterate(
            this.hierarchyTree.hierarchyRoot, 
            (node: HierarchyNode) => {
                result += " " + node.name + " ";
            }
        );
        return result;
    }
    setHierarchyTree(hierarchyTree: HierarchyTree){
        this.hierarchyTree = hierarchyTree;
    }
}

class HierarchyView {
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    display(hierarchyModel: HierarchyModel){
        this.hierarchyWindow.html(hierarchyModel.getHierarchyTree());
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
        console.log(hierarchy);
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
        return currentNode;
    }
    
    iterate(currentNode: HierarchyNode, callback: Function){
        if (currentNode){
            callback(currentNode);
            for (let childNode of currentNode.children){
                this.iterate(childNode, callback);
            }    
        } else {
            return
            
        }
    }
}

class HierarchyNode {
    name: string
    children: Array<HierarchyNode>
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.children = children;
    }
}

let hierarchyTree = new HierarchyTree(
    {
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
    }
)

let hierarchyModel = new HierarchyModel(hierarchyTree);
let hierarchyView = new HierarchyView($("#div001"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);