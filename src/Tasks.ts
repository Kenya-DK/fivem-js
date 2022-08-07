import { DrivingStyle, VehicleSeat } from './enums';
import { AnimationFlags } from './enums';
import { LeaveVehicleFlags } from './enums';
import { FiringPattern } from './enums';
import { Entity } from './models/Entity';
import { Ped } from './models/Ped';
import { Vehicle } from './models/Vehicle';
import { Vector3 } from './utils';

export class TaskSequence {
    public Handle: number;
    private _nullPed: Ped | null = null;
    private _closed = false;
    private _count = 0;
    constructor(handle?: number) {
        if (handle === undefined)
            this.Create();
        else
            this.Handle = handle;

        if (this._nullPed === null)
            this._nullPed = new Ped(0);


    }

    public get IsClosed(): boolean {
        return this._closed;
    }

    public get AddTask(): Tasks {
        if (this._closed)
            throw new Error('Cannot add tasks to a closed sequence');

        this._count++;
        return this._nullPed.Task;
    }

    private Create() {
        // Typescript typings are wrong
        // Natives documentation says it returns a number
        /**
        * // OPEN_SEQUENCE_TASK
        * const taskSequenceId: number = OpenSequenceTask();
        */
        let handle = OpenSequenceTask(0) as any as number;
        this.Handle = handle;
    }

    public Close(repeat: boolean = false) {
        if (this._closed)
            return;

        SetSequenceToRepeat(this.Handle, repeat);
        CloseSequenceTask(this.Handle);

        this._closed = true;
    }
}

export class Tasks {
    constructor(public _ped: Ped) { }

    public AchieveHeading(heading: number, timeout: number = 0) {
        TaskAchieveHeading(this._ped.Handle, heading, timeout);
    }

    public AimAt(entity: Entity, duration: number) {
        TaskAimGunAtEntity(this._ped.Handle, entity.Handle, duration, false);
    }

    public AimAtCoord(x: number, y: number, z: number, duration: number) {
        TaskAimGunAtCoord(this._ped.Handle, x, y, z, duration, false, false);
    }

    public Arrest(target: Entity) {
        TaskArrestPed(this._ped.Handle, target.Handle);
    }

    public ChatTo(ped: Ped) {
        TaskChatToPed(this._ped.Handle, ped.Handle, 16, 0, 0, 0, 0, 0);
    }

    public Jump() {
        TaskJump(this._ped.Handle, true);
    }

    public Climb() {
        TaskClimb(this._ped.Handle, true);
    }

    public ClimbLadder() {
        TaskClimbLadder(this._ped.Handle, true ? 1 : 0);
    }

    public Cower(duration: number) {
        TaskCower(this._ped.Handle, duration);
    }

    public ChaseWithGroundVehicle(target: Entity) {
        TaskVehicleChase(this._ped.Handle, target.Handle);
    }

    public ChaseWithHelicopter(target: Entity, offset: Vector3) {
        TaskHeliChase(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z);
    }

    public ChaseWithPlane(target: Entity, offset: Vector3) {
        TaskPlaneChase(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z);
    }

    public CruiseWithVehicle(vehicle: Vehicle, speed: number, drivingStyle: DrivingStyle) {
        TaskVehicleDriveWander(this._ped.Handle, vehicle.Handle, speed, drivingStyle);
    }

    public DriveTo(vehicle: Vehicle, target: Vector3, radius: number, speed: number, drivingStyle: DrivingStyle) {
        TaskVehicleDriveToCoordLongrange(this._ped.Handle, vehicle.Handle, target.x, target.y, target.z, speed, drivingStyle, radius);
    }

    public EnterAnyVehicle(seat: VehicleSeat, timeout: number = -1, speed: number = 0, flag: number = 0) {
        TaskEnterVehicle(this._ped.Handle, 0, timeout, seat, speed, flag, 0);
    }

    public EnterVehicle(vehicle: Vehicle, seat: VehicleSeat, timeout: number = -1, speed: number = 0, flag: number = 0) {
        TaskEnterVehicle(this._ped.Handle, vehicle.Handle, timeout, seat, speed, flag, 0);
    }

    public static EveryoneLeaveVehicle(vehicle: Vehicle) {
        TaskEveryoneLeaveVehicle(vehicle.Handle);
    }

    public FightAgainst(target: Ped, duration?: number) {
        if (duration !== undefined)
            TaskCombatPedTimed(this._ped.Handle, target.Handle, duration, 0);
        else
            TaskCombatPed(this._ped.Handle, target.Handle, 0, 16);
    }

    public FightAgainstHatedTargets(radius: number, duration?: number) {
        if (duration !== undefined)
            TaskCombatHatedTargetsAroundPedTimed(this._ped.Handle, radius, duration, 0);
        else
            TaskCombatHatedTargetsAroundPed(this._ped.Handle, radius, 0);
    }

    public FleeFromPed(ped: Ped, duration: number = -1) {
        TaskSmartFleePed(this._ped.Handle, ped.Handle, 100, duration, false, false);
    }

    public FleeFromCoord(x: number, y: number, z: number, duration: number = -1) {
        TaskSmartFleeCoord(this._ped.Handle, x, y, z, 100, duration, false, false);
    }

    public FollowPointRoute(points: Vector3[], speed: number = 1.0) {
        TaskFlushRoute();
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            TaskExtendRoute(point.x, point.y, point.z);
        }

        TaskFollowPointRoute(this._ped.Handle, speed, 0);
    }

    public FollowToOffsetFromEntity(
        target: Entity, offset: Vector3,
        movementSpeed: number, timeout: number,
        stoppingRange: number, persistFollowing: boolean
    ) {
        TaskFollowToOffsetOfEntity(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z, movementSpeed, timeout, stoppingRange, persistFollowing);
    }

    public GoToTarget(target: Entity, timeout: number = -1) {
        this.GoToTargetWithOffset(target, Vector3.zero, timeout);
    }

    public GoToTargetWithOffset(target: Entity, offset: Vector3, timeout: number = -1) {
        TaskGotoEntityOffsetXy(this._ped.Handle, target.Handle, timeout, offset.x, offset.y, offset.z, 1.0, true);
    }

    public GoToCoord(position: Vector3, ignorePaths = false, timeout: number = -1) {
        if (ignorePaths) {
            TaskGoStraightToCoord(this._ped.Handle, position.x, position.y, position.z, 1.0, timeout, 0.0, 0.0);
        } else {
            TaskFollowNavMeshToCoord(this._ped.Handle, position.x, position.y, position.z, 1.0, timeout, 0.0, false, 0.0);
        }
    }

    public GuardCurrentPosition() {
        TaskGuardCurrentPosition(this._ped.Handle, 15.0, 10.0, true);
    }

    public HandsUp(duration: number) {
        TaskHandsUp(this._ped.Handle, duration, 0, -1, false);
    }

    public LandPlane(startPosition: Vector3, touchdownPosition: Vector3, plane: Vehicle = null) {
        if (plane == null) {
            plane = this._ped.CurrentVehicle;
        }

        if (plane == null || !plane.exists() || plane.isDead()) {
            TaskPlaneLand(this._ped.Handle, 0, startPosition.x, startPosition.y, startPosition.z, touchdownPosition.x, touchdownPosition.y, touchdownPosition.z);
        }
        else {
            TaskPlaneLand(this._ped.Handle, plane.Handle, startPosition.x, startPosition.y, startPosition.z, touchdownPosition.x, touchdownPosition.y, touchdownPosition.z);
        }
    }

    public LeaveAnyVehicle(flags: LeaveVehicleFlags = LeaveVehicleFlags.None) {
        TaskLeaveAnyVehicle(this._ped.Handle, 0, flags);
    }

    public LeaveVehicle(vehicle: Vehicle, closeDoor: boolean): void;
    public LeaveVehicle(vehicle: Vehicle, flags: LeaveVehicleFlags): void;
    public LeaveVehicle(vehicle: Vehicle, closeDoorOrFlags: boolean | LeaveVehicleFlags) {
        if (typeof closeDoorOrFlags === "boolean")
            TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, closeDoorOrFlags ? LeaveVehicleFlags.None : LeaveVehicleFlags.LeaveDoorOpen);
        else
            TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, closeDoorOrFlags);
    }

    public LookAtEntity(target: Entity, duration: number = 1) {
        TaskLookAtEntity(this._ped.Handle, target.Handle, duration, 0, 2);
    }

    public LookAtCoord(position: Vector3, duration: number = 1) {
        TaskLookAtCoord(this._ped.Handle, position.x, position.y, position.z, duration, 0, 2);
    }

    public ParachuteTo(position: Vector3) {
        TaskParachuteToTarget(this._ped.Handle, position.x, position.y, position.z);
    }

    public ParkVehicle(vehicle: Vehicle, position: Vector3, heading: number, radius: number = 20.0, keepEngineOn: boolean = false) {
        TaskVehiclePark(this._ped.Handle, vehicle.Handle, position.x, position.y, position.z, heading, 1, radius, keepEngineOn);
    }

    public PerformSequence(sequence: TaskSequence) {
        if (!sequence.IsClosed)
            sequence.Close();

        this.ClearAll();
        this._ped.BlockPermanentEvents = true;

        TaskPerformSequence(this._ped.Handle, sequence.Handle);
    }

    public PlayAnimation(
        animDict: string, animName: string,
        blendInSpeed: number = 1.0, blendOutSpeed: number = 1.0,
        duration: number = -1.0, flags: AnimationFlags,
        playbackRate: number
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!HasAnimDictLoaded(animDict))
                RequestAnimDict(animDict);

            let endTime = new Date().getTime() + 1000;
            while (!HasAnimDictLoaded(animDict)) {
                if (new Date().getTime() > endTime) {
                    reject("Could not load anim dict");
                    return;
                }
            }

            TaskPlayAnim(this._ped.Handle, animDict, animName, blendInSpeed, blendOutSpeed, duration, flags, playbackRate, false, false, false);
            resolve(true);
        });
    }

    public ReactAndFlee(target: Entity) {
        TaskReactAndFleePed(this._ped.Handle, target.Handle);
    }

    public ReloadWeapon() {
        TaskReloadWeapon(this._ped.Handle, true);
    }

    public RunTo(position: Vector3, ignorePaths = false, timeout: number = -1) {
        if (ignorePaths)
            TaskGoStraightToCoord(this._ped.Handle, position.x, position.y, position.z, 4.0, timeout, 0.0, 0.0);
        else
            TaskFollowNavMeshToCoord(this._ped.Handle, position.x, position.y, position.z, 4.0, timeout, 0.0, false, 0.0);
    }

    public ShootAtTarget(target: Ped, duration: number = -1, pattern: FiringPattern = FiringPattern.Default) {
        TaskShootAtEntity(this._ped.Handle, target.Handle, duration, pattern);
    }

    public ShootAtCoord(position: Vector3, duration: number = -1, pattern: FiringPattern = FiringPattern.Default) {
        TaskShootAtCoord(this._ped.Handle, position.x, position.y, position.z, duration, pattern);
    }

    public ShuffleToNextVehicleSeat(vehicle: Vehicle) {
        TaskShuffleToNextVehicleSeat(this._ped.Handle, vehicle.Handle);
    }

    public Skydive() {
        TaskSkyDive(this._ped.Handle);
    }

    public SlideTo(position: Vector3, heading: number, duration: number = 0.7) {
        TaskPedSlideToCoord(this._ped.Handle, position.x, position.y, position.z, heading, duration);
    }

    public StandStill(duration: number) {
        TaskStandStill(this._ped.Handle, duration);
    }

    public StartScenario(name: string, position: Vector3) {
        TaskStartScenarioAtPosition(this._ped.Handle, name, position.x, position.y, position.z, 0.0, 0, false, true);
    }

    public SwapWeapon() {
        TaskSwapWeapon(this._ped.Handle, false);
    }

    public TurnToEntity(entity: Entity, duration: number = -1) {
        TaskTurnPedToFaceEntity(this._ped.Handle, entity.Handle, duration);
    }

    public TurnToCoord(position: Vector3, duration: number = -1) {
        TaskTurnPedToFaceCoord(this._ped.Handle, position.x, position.y, position.z, duration);
    }

    public UseParachute() {
        TaskParachute(this._ped.Handle, true);
    }

    public UseMobilePhone(duration?: number) {
        if (duration != null)
            TaskUseMobilePhoneTimed(this._ped.Handle, duration);
        else
            TaskUseMobilePhone(this._ped.Handle, 1);
    }

    public PutAwayParachute() {
        TaskParachute(this._ped.Handle, false);
    }

    public PutAwayMobilePhone() {
        TaskUseMobilePhone(this._ped.Handle, 0);
    }

    public VehicleChase(target: Ped) {
        TaskVehicleChase(this._ped.Handle, target.Handle);
    }

    public VehicleShootAtPed(target: Ped) {
        TaskVehicleShootAtPed(this._ped.Handle, target.Handle, 0);
    }

    public Wait(duration: number) {
        TaskPause(this._ped.Handle, duration);
    }

    public WanderAround() {
        TaskWanderStandard(this._ped.Handle, 10.0, 10.0);
    }

    public WanderAroundInArea(position: Vector3, radius: number) {
        TaskWanderInArea(this._ped.Handle, position.x, position.y, position.z, radius, 10.0, 10.0);
    }

    public WarpIntoVehicle(vehicle: Vehicle, seat: number) {
        TaskWarpPedIntoVehicle(this._ped.Handle, vehicle.Handle, seat);
    }

    public WarpOutOfVehicle(vehicle: Vehicle) {
        TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, LeaveVehicleFlags.WarpOut);
    }

    public ClearAll() {
        ClearPedTasks(this._ped.Handle);
    }

    public ClearAllImmediately() {
        ClearPedTasksImmediately(this._ped.Handle);
    }

    public ClearLookAt() {
        TaskClearLookAt(this._ped.Handle);
    }

    public ClearSecondary() {
        ClearPedSecondaryTask(this._ped.Handle);
    }

    public ClearAnimation(animDict: string, animName: string) {
        StopAnimTask(this._ped.Handle, animDict, animName, -4.0);
    }
}