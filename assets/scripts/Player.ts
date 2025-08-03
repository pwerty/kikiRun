import { _decorator, Component, input, Input, KeyCode, Vec2, RigidBody2D, EventKeyboard } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property
    jumpForce: number = 300;

    private rigidBody: RigidBody2D | null = null;

    start() {        
        // Rigidbody2D 컴포넌트 가져오기
        this.rigidBody = this.getComponent(RigidBody2D);

        // 키 입력 리스너 등록
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        // 키 입력 리스너 해제
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.SPACE) {
            if (this.rigidBody) {
                // 점프용 위쪽 힘 가하기
                this.rigidBody.applyLinearImpulseToCenter(
                    new Vec2(0, this.jumpForce),
                    true
                );
            }
        }
    }
}
