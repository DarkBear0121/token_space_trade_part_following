import * as THREE from "three";
import { Matrix3, Matrix4 } from "three";
import { Assets } from "./assets";
import { Construction } from "./construction";
import { InWorldItem } from "./inWorldItem";

export class AstroGen {
  constructor(private universeGroup: THREE.Object3D,
    private construction: Construction) {
  }

  private buildCone() {
    for (let x = -20; x < 20; x++) {
      for (let y = -20; y < 20; y++) {
        for (let z = 0; z < 20; z++) {
          if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) < z / 2) {
            const baseItem = Assets.items[0];
            const position = new THREE.Vector3(x, y, -z * 2 - 10);
            const quaterion = new THREE.Quaternion();
            this.construction.addCube(
              new InWorldItem(baseItem, position, quaterion));
          }
        }
      }
    }
  }

  private changeColor(mesh: THREE.Mesh) {
    console.assert(mesh.type === "Mesh");
    const material = new THREE.MeshStandardMaterial();
    Object.assign(material, mesh.material);
    let r = material.color.r;
    let g = material.color.g;
    let b = material.color.b;
    r += (Math.random() - 0.5) * .1;
    g += (Math.random() - 0.5) * .1;
    b += (Math.random() - 0.5) * .1;
    material.color = new THREE.Color(r, g, b);
    material.needsUpdate = true;
    mesh.material = material;
  }

  private addAt(x: number, y: number, z: number) {
    const rotation = new Matrix4();
    rotation.makeRotationFromEuler(new THREE.Euler(
      Math.round(Math.random() * 4) * Math.PI / 2,
      Math.round(Math.random() * 4) * Math.PI / 2,
      Math.round(Math.random() * 4) * Math.PI / 2
    ));
    const quaterion = new THREE.Quaternion();
    quaterion.setFromRotationMatrix(rotation);
    const inWorldItem = new InWorldItem(
      Assets.itemsByName.get('cube-tweek'),
      new THREE.Vector3(x, y, z),
      quaterion);
    this.construction.addCube(inWorldItem);
  }

  buildPlatform(xDim: number, yDim: number, zDim: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -xDim; x < xDim; x++) {
      for (let y = -yDim; y < 0; y++) {
        for (let z = -zDim; z < zDim; z++) {
          let xProb = (xDim - Math.abs(x)) / xDim;
          let yProb = (yDim - Math.abs(y)) / yDim;
          let zProb = (zDim - Math.abs(z)) / zDim;

          if (xProb * yProb * zProb > (Math.random() / 10) + 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }

  buildAsteroid(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -r; x < r; x++) {
      for (let y = -r; y < r; y++) {
        for (let z = -r; z < r; z++) {
          if (Math.sqrt(x * x + y * y + z * z) < r + Math.random() - 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }
}