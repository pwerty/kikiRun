import { _decorator, Component, RigidBody2D, v2, Collider2D, Layers, log, input, Input, KeyCode, EventKeyboard, Vec2, PhysicsSystem2D, Rect, EPhysics2DDrawFlags } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    // --- 점프 및 물리 속성 ---
    @property({ tooltip: '점프 시 가해지는 힘의 크기' })
    public jumpForce: number = 800;

    @property({ tooltip: '땅에 닿기 전까지 가능한 최대 점프 횟수' })
    public maxJumps: number = 2;
    
    @property
    public customGravity: number = -2500;

    @property({ tooltip: '점프 직후 땅 판정을 무시할 시간 (0.1초 정도가 적당)' })
        public jumpCooldownDuration: number = 0.1;

    
    @property({ tooltip: '낙하 시 중력에 적용할 배율. 1보다 크면 더 빨리 떨어집니다.' })
    public fallGravityMultiplier: number = 2;
    
    @property({ tooltip: '발판에서 떨어진 후에도 땅으로 인정해 줄 시간' })
    public coyoteTimeDuration: number = 0.1;

    // --- 바닥 감지 관련 속성 ---
    @property({ tooltip: '플레이어 발밑에 생성될 감지 영역의 높이' })
    public groundCheckDistance: number = 5;

    @property({ tooltip: '감지 영역의 너비를 플레이어보다 얼마나 넓게 할지 (1.1 = 10% 넓게)' })
    public groundCheckWidthMultiplier: number = 1.1;

    
    private rb: RigidBody2D = null;
    private playerCollider: Collider2D = null; // 플레이어의 메인 콜라이더
    private jumpsRemaining: number = 0;
    private coyoteTimeCounter: number = 0;
    private jumpCooldown: number = 0;
    onLoad() {
        this.rb = this.getComponent(RigidBody2D);
        this.playerCollider = this.getComponent(Collider2D);
        this.rb.gravityScale = 0;

        // 키 입력 리스너 등록
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        
        // 디버그 드로잉 활성화 (개발 중에만 사용 권장)
        // PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.drawFlags = EPhysics2DDrawFlags.Aabb;
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    
    // [신규] 코드로 바닥을 감지하는 함수
    private checkIfGrounded(): boolean {
        if (!this.playerCollider) return false;

        const colliderAABB = this.playerCollider.worldAABB;
        const checkWidth = colliderAABB.width * this.groundCheckWidthMultiplier;

        // 플레이어 발밑에 가상의 사각형(Rect)을 정의
        const groundCheckRect = new Rect(
            colliderAABB.center.x - checkWidth / 2,
            colliderAABB.y - this.groundCheckDistance,
            checkWidth,
            this.groundCheckDistance
        );

        // 이 사각형과 충돌하는 모든 콜라이더를 가져옴
        const results = PhysicsSystem2D.instance.testAABB(groundCheckRect);
        
        // 결과에서 자기 자신(플레이어)을 제외
        const filteredResults = results.filter(res => res !== this.playerCollider);
        
        // 자신을 제외하고 충돌한 대상이 하나라도 있으면 땅에 있는 것으로 간주
        return filteredResults.length > 0;
    }

    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.SPACE) {
            this.performJump();
        }
    }


private performJump() {
    if (this.jumpsRemaining > 0) {
        const velocity = this.rb.linearVelocity;
        velocity.y = 0;
        this.rb.linearVelocity = velocity;
        this.rb.applyLinearImpulseToCenter(new Vec2(0, this.jumpForce), true);
        
        this.jumpsRemaining--;
        this.coyoteTimeCounter = 0;

        // [추가] 점프를 했으니, 쿨다운 타이머를 시작합니다.
        this.jumpCooldown = this.jumpCooldownDuration;
    }
}

update(deltaTime: number) {
    // [추가] 매 프레임 쿨다운 타이머를 감소시킵니다.
    if (this.jumpCooldown > 0) {
        this.jumpCooldown -= deltaTime;
    }

    const isPhysicallyGrounded = this.checkIfGrounded();
    // [수정] 땅에 닿아있고, 점프 쿨다운도 끝났을 때만 '진짜 땅'으로 인정합니다.
    const isLogicallyGrounded = isPhysicallyGrounded && this.jumpCooldown <= 0;

    if (isLogicallyGrounded) {
        this.coyoteTimeCounter = this.coyoteTimeDuration;
    } else {
        this.coyoteTimeCounter -= deltaTime;
    }

        const velocity = this.rb.linearVelocity;

        if (this.coyoteTimeCounter > 0) {
            if (this.jumpsRemaining < this.maxJumps) {
                this.jumpsRemaining = this.maxJumps;
            }
            if (velocity.y < 0) {
                velocity.y = 0;
            }
        } else {
            if (velocity.y < 0) {
                velocity.y += this.customGravity * this.fallGravityMultiplier * deltaTime;
            } else {
                velocity.y += this.customGravity * deltaTime;
            }
        }

        velocity.x = 0;
        this.rb.linearVelocity = velocity;
    }
}
