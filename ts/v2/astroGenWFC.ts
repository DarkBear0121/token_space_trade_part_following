import * as THREE from "three";
import { Construction } from "./construction";
import { LocationMap } from "./locationMap";

// class Rule {
//     cnt: number = 1;
//     constructor(public location: THREE.Vector3, public item: number) {
//     }
// }

export class AstroGenWFC {
    // is: Map<THREE.Vector3, number> = new Map();
    // canBe: Map<THREE.Vector3, number[]> = new Map();
    // rules: Map<number, Rule[]> = new Map();
    // example: Map<THREE.Vector3, number> = new Map();

    is: LocationMap<number> = new LocationMap<number>();
    canBe: LocationMap<number[]> = new LocationMap<number[]>();
    rules: Map<number, LocationMap<number[]>> = new Map();
    example: LocationMap<number> = new LocationMap<number>();
    private ruleOffset: THREE.Vector3[] = [];

    constructor() {
        this.ruleOffset.push(new THREE.Vector3(0, 0, 1));
        this.ruleOffset.push(new THREE.Vector3(0, 0, -1));
        this.ruleOffset.push(new THREE.Vector3(0, 1, 0));
        this.ruleOffset.push(new THREE.Vector3(0, -1, 0));
        this.ruleOffset.push(new THREE.Vector3(1, 0, 0));
        this.ruleOffset.push(new THREE.Vector3(-1, 0, 0));
    }

    public makeExample() {
        this.example.set(new THREE.Vector3(0, 0, 0), 1);
        this.example.set(new THREE.Vector3(0, 1, 0), 1);
    }

    private getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    public makeRules() {
        for (const [pos, item] of this.example.entries()) {
            if (!this.rules.has(item)) {
                this.rules.set(item, new LocationMap<number[]>());
            }
            for (const offset of this.ruleOffset) {
                const checkPos = new THREE.Vector3()
                checkPos.add(pos)
                checkPos.add(offset)
                let ruleItem: number = 0;
                if (this.example.has(checkPos)) {
                    ruleItem = this.example.get(checkPos) as number;
                }
                if (!this.rules.get(item).has(offset)) {
                    this.rules.get(item).set(offset, [])
                }
                let items = this.rules.get(item).get(offset);
                if (!items.includes(ruleItem)) {
                    items.push(ruleItem)
                }
                this.rules.get(item)?.set(offset, items);
            }
        }
    }

    private mergeItems(a: number[], b: number[]) {
        let newItems: number[] = [];
        for (const item of a) {
            if (b.includes(item)) {
                newItems.push(item);
            }
        }
        return newItems;
    }

    public build() {
        const index = this.getRandomInt(this.rules.keys.length);
        let item: number = this.rules.keys()[index];
        let pos = new THREE.Vector3(0, 0, 0);
        this.is.set(pos, item);
        for (const offset of this.ruleOffset) {
            const setPos = new THREE.Vector3()
            setPos.add(pos)
            setPos.add(offset)
            let cellCanBe: number[] = this.rules.get(item).get(offset);
            if (this.canBe.has(setPos)) {
                cellCanBe = this.mergeItems(this.canBe.get(setPos), cellCanBe)
            }
            this.canBe.set(setPos, cellCanBe);
        }
    }
}