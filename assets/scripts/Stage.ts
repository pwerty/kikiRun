import { _decorator, Component, RigidBody2D, v2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Stage')
export class Stage extends Component {
    @property
    speed: number = 1;

    private rb: RigidBody2D = null;

    onLoad() {
        // RigidBody2D 컴포넌트를 가져옵니다.
        this.rb = this.getComponent(RigidBody2D);
    }

    // Kinematic 바디는 물리 시뮬레이션의 영향을 받지 않으므로, 
    // update 대신 fixedUpdate에서 물리 관련 로직을 처리하는 것이 더 안정적일 수 있습니다.
    // 하지만 이 경우 update를 사용해도 무방합니다.
    update(deltaTime: number) {
        // setPosition 대신 setLinearVelocity를 사용하여 속도를 제어합니다.
        if (this.rb) {
            this.rb.linearVelocity = v2(-this.speed, 0);
        }
    }
}
