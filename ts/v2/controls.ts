import * as THREE from "three";
import { XRHandedness } from "three";

export class StartStopEvent {
  constructor(
    readonly handedness: THREE.XRHandedness,
    readonly state: 'start' | 'end',
    readonly type: 'squeeze' | 'grip',
    readonly worldPosition: THREE.Vector3) { }
}

export type StartStopEventHandler = (ev: StartStopEvent) => void;


export class Controls {
  constructor(
    private camera: THREE.PerspectiveCamera,
    private canvas: HTMLCanvasElement) {
    const km = new Set<string>();
    document.body.addEventListener('keydown', (ke: KeyboardEvent) => {
      km.add(ke.code);
    });
    document.body.addEventListener('keyup', (ke: KeyboardEvent) => {
      km.delete(ke.code);
    });
    this.keysDown = km;

    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      this.pointer.x = (ev.clientX / canvas.width) * 2 - 1;
      this.pointer.y = - (ev.clientY / canvas.height) * 2 + 1;
    });

    const leftPosition = new THREE.Vector3();
    const rightPosition = new THREE.Vector3();

    canvas.addEventListener('mousedown', (ev: MouseEvent) => {
      if (!!this.startStopCallback) {
        this.setPositions(
          leftPosition, rightPosition, this.camera);
        this.startStopCallback(
          new StartStopEvent('left', 'start', 'grip', leftPosition));
      }
    });
    canvas.addEventListener('mouseup', (ev: MouseEvent) => {
      if (!!this.startStopCallback) {
        this.setPositions(
          leftPosition, rightPosition, this.camera);
        this.startStopCallback(
          new StartStopEvent('left', 'end', 'grip', leftPosition));
      }
    });
  }

  readonly keysDown: Set<string>

  private startStopCallback: StartStopEventHandler = undefined;
  public setStartStopCallback(cb: StartStopEventHandler) {
    this.startStopCallback = cb;
  }

  public forwardBack() {
    let result = 0;
    if (!!this.leftSource) {
      result = this.leftSource.gamepad.axes[3];
    }
    if (this.keysDown.has('KeyW')) {
      result += -1.0;
    }
    if (this.keysDown.has('KeyS')) {
      result += 1.0;
    }
    return result;
  }
  public leftRight() {
    let result = 0;
    if (!!this.leftSource) {
      result = this.leftSource.gamepad.axes[2];
    }
    if (this.keysDown.has('KeyD')) {
      result += 1.0;
    }
    if (this.keysDown.has('KeyA')) {
      result += -1.0;
    }
    return result;
  }

  public upDown() {
    let result = 0;
    if (!!this.rightSource) {
      result = -this.rightSource.gamepad.axes[3];
    }
    if (this.keysDown.has('ArrowUp')) {
      result += 1.0;
    }
    if (this.keysDown.has('ArrowDown')) {
      result += -1.0;
    }
    return result;
  }
  public spinLeftRight() {
    let result = 0;
    if (!!this.rightSource) {
      result = -Math.pow(this.rightSource.gamepad.axes[2], 3);
    }
    if (this.keysDown.has('ArrowRight')) {
      result += -1.0;
    }
    if (this.keysDown.has('ArrowLeft')) {
      result += 1.0;
    }
    return result;
  }

  private pointer = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private tmp = new THREE.Vector3();
  private setFromGrip(source: THREE.Object3D, target: THREE.Vector3) {
    source.getWorldPosition(target);
    this.camera.getWorldPosition(this.tmp);
    target.sub(this.tmp);
    target.multiplyScalar(10);
    target.add(this.tmp);
  }

  public setPositions(left: THREE.Vector3, right: THREE.Vector3,
    camera: THREE.PerspectiveCamera) {
    if (this.leftGrip && this.rightGrip) {
      this.setFromGrip(this.leftGripLocation, left);
      this.setFromGrip(this.rightGripLocation, right);
    } else {
      this.raycaster.setFromCamera(this.pointer, camera);
      left.copy(this.raycaster.ray.direction);
      left.multiplyScalar(10);
      left.add(this.raycaster.ray.origin);
      right.set(0, 0, 0);
    }
  }

  private session: THREE.XRSession = undefined;
  private leftSource: THREE.XRInputSource = undefined;
  private rightSource: THREE.XRInputSource = undefined;
  private leftGrip: THREE.Group;
  private rightGrip: THREE.Group;
  private leftGripLocation: THREE.Object3D;
  private rightGripLocation: THREE.Object3D;

  private tmpVector = new THREE.Vector3();
  public setSession(session: THREE.XRSession,
    leftGrip: THREE.Group, rightGrip: THREE.Group) {
    this.session = session;
    this.leftGrip = leftGrip;
    this.leftGripLocation = new THREE.Object3D();
    this.leftGrip.add(this.leftGripLocation);
    this.rightGrip = rightGrip;
    this.rightGripLocation = new THREE.Object3D();
    this.rightGrip.add(this.rightGripLocation);
    if (session.inputSources && session.inputSources.length >= 2) {
      for (const source of session.inputSources) {
        if (source.handedness === 'left') {
          this.leftSource = source;
        } else {
          this.rightSource = source;
        }
      }
    }
    this.addListeners('left', leftGrip, this.leftGripLocation);
    this.addListeners('right', rightGrip, this.rightGripLocation);
  }

  private addListeners(side: XRHandedness,
    grip: THREE.Object3D, gripLocation: THREE.Object3D) {

    grip.addEventListener('selectstart', (ev) => {
      if (!!this.startStopCallback) {
        gripLocation.getWorldPosition(this.tmpVector);
        this.startStopCallback(
          new StartStopEvent(side, 'start', 'grip', this.tmpVector));
      }
    });
    grip.addEventListener('selectend', (ev) => {
      if (!!this.startStopCallback) {
        gripLocation.getWorldPosition(this.tmpVector);
        this.startStopCallback(
          new StartStopEvent(side, 'end', 'grip', this.tmpVector));
      }
    });

  }

  public hasSession(): boolean {
    return !!this.session && !!this.leftSource;
  }
}