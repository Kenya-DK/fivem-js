import { DrivingStyle, VehicleSeat } from './enums';
import { AnimationFlags } from './enums';
import { LeaveVehicleFlags } from './enums';
import { FiringPattern } from './enums';
import { Entity } from './models/Entity';
import { Ped } from './models/Ped';
import { Vehicle } from './models/Vehicle';
import { Delay, Vector3 } from './utils';

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

    /**
 * Task face a direction 
 *
 * @param heading The desired heading.  
 * @param timeout The time, in milliseconds, to allow the task to complete. 
 * If the task times out, it is cancelled, and the ped will stay at the heading it managed to reach in the time. 
 */
    public AchieveHeading(heading: number, timeout: number = 0) {
        TaskAchieveHeading(this._ped.Handle, heading, timeout);
    }
    /**
   * Task aim at a target entity.
   *
   * @param entity The target entity.  
   * @param duration The amount of time in milliseconds to do the task.  
   * -1 will keep the task going until either another task is applied
   */
    public AimAt(entity: Entity, duration: number) {
        TaskAimGunAtEntity(this._ped.Handle, entity.Handle, duration, false);
    }
    /**
   * Task aim at coords.
   *
   * @param pos The position to aim at.
   * @param duration the amount of time in milliseconds to do the task.  
   * -1 will keep the task going until either another task is applied
   */
    public AimAtCoord(pos: Vector3, duration: number) {
        TaskAimGunAtCoord(this._ped.Handle, pos.x, pos.y, pos.z, duration, false, false);
    }
    /**
   * Task arrest a target ped.
   *
   * @param target The target ped.
   */
    public Arrest(target: Entity) {
        TaskArrestPed(this._ped.Handle, target.Handle);
    }
    /**
   * Task chat with a target ped.
   *
   * @param ped The target ped.
   */
    public ChatTo(ped: Ped) {
        TaskChatToPed(this._ped.Handle, ped.Handle, 16, 0, 0, 0, 0, 0);
    }
    /**
   * Task jump jump.
   */
    public Jump() {
        TaskJump(this._ped.Handle, true);
    }
    /**
   * Task climb.
   */
    public Climb() {
        TaskClimb(this._ped.Handle, true);
    }
    /**
   * Task climb on a ladder.
   */
    public ClimbLadder() {
        TaskClimbLadder(this._ped.Handle, true ? 1 : 0);
    }
    /**
   * Task cower.
   *
   * @param duration The amount of time in milliseconds to do the task.
   */
    public Cower(duration: number) {
        TaskCower(this._ped.Handle, duration);
    }
    /**
   * Task chase a target ped with a vehicle.
   *
   * @param target The target ped.
   */
    public ChaseWithGroundVehicle(target: Entity) {
        TaskVehicleChase(this._ped.Handle, target.Handle);
    }
    /**
   * Task chase a target ped with a helicopter.
   *
   * @param target The target ped.
   * @param offset Appear to be how close to the EntityToFollow the heli should be. Scripts use 0.0, 0.0, 80.0.
   * Then the heli tries to position itself 80 units above the EntityToFollow. 
   * If you reduce it to -5.0, it tries to go below (if the EntityToFollow is a heli or plane)  
   */
    public ChaseWithHelicopter(target: Entity, offset: Vector3) {
        TaskHeliChase(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z);
    }
    /**
   * Task chase a target ped with a plane.
   *
   * @param target The target ped.
   * @param offset Appear to be how close to the EntityToFollow the heli should be. Scripts use 0.0, 0.0, 80.0.
   * Then the heli tries to position itself 80 units above the EntityToFollow. 
   * If you reduce it to -5.0, it tries to go below (if the EntityToFollow is a heli or plane)  
   */
    public ChaseWithPlane(target: Entity, offset: Vector3) {
        TaskPlaneChase(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z);
    }
    /**
   * Task chase a target ped with a plane.
   * Drive randomly with no destination set.
   *
   * @param vehicle Vehicle entity id for the task.
   * @param speed Speed of driving.
   * @param drivingStyle The driving style 
   * More info https://vespura.com/fivem/drivingstyle/.
   */
    public CruiseWithVehicle(vehicle: Vehicle, speed: number, drivingStyle: DrivingStyle) {
        TaskVehicleDriveWander(this._ped.Handle, vehicle.Handle, speed, drivingStyle);
    }
    /**
   * Task drive to a destination.
   *
   * @param vehicle Vehicle entity id for the task.
   * @param target The target coordinates.
   * @param radius Stops in the specific range near the destination. 20.0 works fine.
   * @param speed Speed of driving.
   * @param drivingStyle The driving style 
   * More info https://vespura.com/fivem/drivingstyle/.
   */
    public DriveTo(vehicle: Vehicle, target: Vector3, radius: number, speed: number, drivingStyle: DrivingStyle) {
        TaskVehicleDriveToCoordLongrange(this._ped.Handle, vehicle.Handle, target.x, target.y, target.z, speed, drivingStyle, radius);
    }
    /**
   * Task enter a vehicle.
   *
   * @param seat The seat to enter.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   * @param speed 1.0 = walk, 2.0 = run  
   * @param flag 1 = normal.
   * 3 = teleport to vehicle.
   * 8 = normal/carjack ped from seat.
   * 16 = teleport directly into vehicle.
   */
    public EnterAnyVehicle(seat: VehicleSeat, timeout: number = -1, speed: number = 0, flag: number = 0) {
        TaskEnterVehicle(this._ped.Handle, 0, timeout, seat, speed, flag, 0);
    }
    /**
   * Task enter a target vehicle.
   *
   * @param vehicle The target vehicle.
   * @param seat The seat to enter.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   * @param speed 1.0 = walk, 2.0 = run  
   * @param flag 1 = normal.
   * 3 = teleport to vehicle.
   * 8 = normal/carjack ped from seat.
   * 16 = teleport directly into vehicle.
   */
    public EnterVehicle(vehicle: Vehicle, seat: VehicleSeat, timeout: number = -1, speed: number = 0, flag: number = 0) {
        TaskEnterVehicle(this._ped.Handle, vehicle.Handle, timeout, seat, speed, flag, 0);
    }
    /**
   * Task kick everyone out of a vehicle.
   *
   * @param vehicle The target vehicle.
   */
    public static EveryoneLeaveVehicle(vehicle: Vehicle) {
        TaskEveryoneLeaveVehicle(vehicle.Handle);
    }
    /**
   * Task fight with a target ped.
   *
   * @param target The target ped.
   * @param duration The fight duration in milliseconds (-1 = infinite).
   */
    public FightAgainst(target: Ped, duration?: number) {
        if (duration !== undefined && duration !== -1)
            TaskCombatPedTimed(this._ped.Handle, target.Handle, duration, 0);
        else
            TaskCombatPed(this._ped.Handle, target.Handle, 0, 16);
    }
    /**
   * Task fight against targets in a radius.
   *
   * @param radius The radius to fight in.
   * @param duration The fight duration in milliseconds (-1 = infinite).
   */
    public FightAgainstHatedTargets(radius: number, duration?: number) {
        if (duration !== undefined && duration !== -1)
            TaskCombatHatedTargetsAroundPedTimed(this._ped.Handle, radius, duration, 0);
        else
            TaskCombatHatedTargetsAroundPed(this._ped.Handle, radius, 0);
    }
    /**
   * Task flee from a target ped.
   *
   * @param ped The target ped.
   * @param duration The flee duration in milliseconds (-1 = infinite).
   */
    public FleeFromPed(ped: Ped, duration: number = -1) {
        TaskSmartFleePed(this._ped.Handle, ped.Handle, 100, duration, false, false);
    }
    /**
   * Task flee from a target coordinates.
   *
   * @param pos The coordinates to flee from.
   * @param duration The flee duration in milliseconds (-1 = infinite).
   */
    public FleeFromCoord(pos: Vector3, duration: number = -1) {
        TaskSmartFleeCoord(this._ped.Handle, pos.x, pos.y, pos.z, 100, duration, false, false);
    }
    /**
   * Task follow point route.
   *
   * @param points The points to follow.
   * @param speed The speed to travel at.
   */
    public FollowPointRoute(points: Vector3[], speed: number = 1.0) {
        TaskFlushRoute();
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            TaskExtendRoute(point.x, point.y, point.z);
        }

        TaskFollowPointRoute(this._ped.Handle, speed, 0);
    }
    /**
   * Task follow offset of a target ped.
   *
   * @param target The target entity.
   * @param offset The offset to follow.
   * @param movementSpeed The movement speed.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   * @param stoppingRange The stopping range.
   * @param persistFollowing If the ped should persist following the target.
   */
    public FollowToOffsetFromEntity(
        target: Entity, offset: Vector3,
        movementSpeed: number, timeout: number,
        stoppingRange: number, persistFollowing: boolean
    ) {
        TaskFollowToOffsetOfEntity(this._ped.Handle, target.Handle, offset.x, offset.y, offset.z, movementSpeed, timeout, stoppingRange, persistFollowing);
    }
    /**
   * Task go to a target entity.
   *
   * @param target The target entity.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   */
    public GoToTarget(target: Entity, timeout: number = -1) {
        this.GoToTargetWithOffset(target, Vector3.zero, timeout);
    }
    /**
   * Task go to a target entity with an offset.
   *
   * @param target The target entity.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   * @param offset The offset to go to.
   */
    public GoToTargetWithOffset(target: Entity, offset: Vector3, timeout: number = -1) {
        TaskGotoEntityOffsetXy(this._ped.Handle, target.Handle, timeout, offset.x, offset.y, offset.z, 1.0, true);
    }
    /**
   * Task go to coordinates.
   *
   * @param position The target position.
   * @param ignorePaths If paths should be ignored.
   * @param timeout The amount of time in milliseconds to wait for the task to complete.
   */
    public GoToCoord(position: Vector3, ignorePaths = false, timeout: number = -1) {
        if (ignorePaths) {
            TaskGoStraightToCoord(this._ped.Handle, position.x, position.y, position.z, 1.0, timeout, 0.0, 0.0);
        } else {
            TaskFollowNavMeshToCoord(this._ped.Handle, position.x, position.y, position.z, 1.0, timeout, 0.0, false, 0.0);
        }
    }
    /**
   * Task guard current position.
   */
    public GuardCurrentPosition() {
        TaskGuardCurrentPosition(this._ped.Handle, 15.0, 10.0, true);
    }
    /**
   * Task hands up.
   *
   * @param duration The duration in milliseconds (-1 = infinite).
   */
    public HandsUp(duration: number) {
        TaskHandsUp(this._ped.Handle, duration, 0, -1, false);
    }
    /**
   * Task land a plane.
   *
   * @param startPosition The start position.
   * @param touchdownPosition The touchdown position.
   * @param plane The plane to land.
   */
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
    /**
   * Task leave any vehicle.
   *
   * @param flags The leave vehicle flags.
   */
    public LeaveAnyVehicle(flags: LeaveVehicleFlags = LeaveVehicleFlags.None) {
        TaskLeaveAnyVehicle(this._ped.Handle, 0, flags);
    }

    /**
   * Task leave vehicle.
   *
   * @param vehicle The vehicle to leave.
   * @param closeDoor The door to close.
   */
    public LeaveVehicle(vehicle: Vehicle, closeDoor: boolean): void;
    /**
   * Task leave vehicle.
   *
   * @param vehicle The vehicle to leave.
   * @param flags The leave vehicle flags.
   */
    public LeaveVehicle(vehicle: Vehicle, flags: LeaveVehicleFlags): void;
    public LeaveVehicle(vehicle: Vehicle, closeDoorOrFlags: boolean | LeaveVehicleFlags) {
        if (typeof closeDoorOrFlags === "boolean")
            TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, closeDoorOrFlags ? LeaveVehicleFlags.None : LeaveVehicleFlags.LeaveDoorOpen);
        else
            TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, closeDoorOrFlags);
    }
    /**
   * Task look at entity.
   *
   * @param target The entity to look at.
   * @param duration The duration in milliseconds (-1 = infinite).
   */
    public LookAtEntity(target: Entity, duration: number = 1) {
        TaskLookAtEntity(this._ped.Handle, target.Handle, duration, 0, 2);
    }
    /**
   * Task look at coordinate.
   *
   * @param position The coordinate to look at.
   * @param duration The duration in milliseconds (-1 = infinite).
   */
    public LookAtCoord(position: Vector3, duration: number = 1) {
        TaskLookAtCoord(this._ped.Handle, position.x, position.y, position.z, duration, 0, 2);
    }
    /**
   * Task parachute to coordinates.
   *
   * @param position The coordinate to land at.
   */
    public ParachuteTo(position: Vector3) {
        TaskParachuteToTarget(this._ped.Handle, position.x, position.y, position.z);
    }
    /**
   * Task park vehicle at coordinates.
   *
   * @param vehicle The vehicle to park.
   * @param position The position to park at.
   * @param heading The heading to park at.
   * @param radius The park radius.
   * @param keepEngineOn The engine should be on after parking.
   */
    public ParkVehicle(vehicle: Vehicle, position: Vector3, heading: number, radius: number = 20.0, keepEngineOn: boolean = false) {
        TaskVehiclePark(this._ped.Handle, vehicle.Handle, position.x, position.y, position.z, heading, 1, radius, keepEngineOn);
    }
    /**
   * Task perform sequence.
   *
   * @param sequence The sequence to perform.
   */
    public PerformSequence(sequence: TaskSequence) {
        if (!sequence.IsClosed)
            sequence.Close();

        this.ClearAll();
        this._ped.BlockPermanentEvents = true;

        TaskPerformSequence(this._ped.Handle, sequence.Handle);
    }
    /**
   * Task paly advanced animation.
   *
   * @param animDict The animation dictionary.
   * @param animName The animation name.
   * @param pos The position to play the animation.
   * @param rot The rotation to play the animation.
   * @param animEnter Adjust character speed to fully enter animation
   * @param animExit Adjust character speed to fully exit animation
   * @param duration Time in milliseconds
   * @param flag The animation flag.
   * @param time Value between 0.0 and 1.0, lets you start an animation from the given point
   * @param waitTime The time in milliseconds to wait for the animation to complete.
   * @param autoStop The should stop the animation after it has completed.
   */
    public PlayAnimAdvanced(
        animDict: string, animName: string,
        pos: Vector3, rot: Vector3,
        animEnter: number, animExit: number,
        duration: number, flag: AnimationFlags,
        time: number, waitTime: number,
        autoStop: boolean = true
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!HasAnimDictLoaded(animDict))
                RequestAnimDict(animDict);

            let endTime = new Date().getTime() + 5000;
            while (!HasAnimDictLoaded(animDict)) {
                if (new Date().getTime() > endTime) {
                    reject("Could not load anim dict");
                    return;
                }
            }

            TaskPlayAnimAdvanced(this._ped.Handle, animDict, animName, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, animEnter, animExit, duration, flag, time, 0, 0);
            if (waitTime > 0)
                await Delay(waitTime);

            if (autoStop) this.ClearAll();
            resolve(true);
        });
    }
    /**
   * Task paly animation.
   *
   * @param animDict The animation dictionary.
   * @param animName The animation name.
   * @param blendInSpeed The blend in speed.
   * @param blendOutSpeed The blend out speed.
   * @param duration Time in milliseconds.
   * @param flags The animation flag.
   * @param playbackRate Value between 0.0 and 1.0, lets you start an animation from the given point.
   * @param waitTime The time in milliseconds to wait for the animation to complete.
   * @param autoStop The should stop the animation after it has completed.
   */
    public PlayAnimation(
        animDict: string, animName: string,
        blendInSpeed: number = 1.0, blendOutSpeed: number = 1.0,
        duration: number = -1.0, flags: AnimationFlags,
        playbackRate: number,
        waitTime: number = -1,
        autoStop: boolean = true
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!HasAnimDictLoaded(animDict))
                RequestAnimDict(animDict);

            let endTime = new Date().getTime() + 5000;
            while (!HasAnimDictLoaded(animDict)) {
                if (new Date().getTime() > endTime) {
                    reject("Could not load anim dict");
                    return;
                }
            }

            TaskPlayAnim(this._ped.Handle, animDict, animName, blendInSpeed, blendOutSpeed, duration, flags, playbackRate, false, false, false);
            if (waitTime > 0)
                await Delay(waitTime);

            if (autoStop) this.ClearAll();
            resolve(true);
        });
    }
    /**
   * Task react and flee.
   *
   * @param target The target to flee from.
   */
    public ReactAndFlee(target: Entity) {
        TaskReactAndFleePed(this._ped.Handle, target.Handle);
    }
    /**
   * Task reload weapon.
   */
    public ReloadWeapon() {
        TaskReloadWeapon(this._ped.Handle, true);
    }
    /**
   * Task run to coordinates.
   *
   * @param position The position to run to.
   * @param ignorePaths Whether to ignore paths.
   * @param timeout The timeout in milliseconds.
   */
    public RunTo(position: Vector3, ignorePaths = false, timeout: number = -1) {
        if (ignorePaths)
            TaskGoStraightToCoord(this._ped.Handle, position.x, position.y, position.z, 4.0, timeout, 0.0, 0.0);
        else
            TaskFollowNavMeshToCoord(this._ped.Handle, position.x, position.y, position.z, 4.0, timeout, 0.0, false, 0.0);
    }
    /**
   * Task shoot at entity.
   *
   * @param target The target ped to shoot at.
   * @param duration The duration in milliseconds.
   * @param pattern The pattern.
   */
    public ShootAtTarget(target: Ped, duration: number = -1, pattern: FiringPattern = FiringPattern.Default) {
        TaskShootAtEntity(this._ped.Handle, target.Handle, duration, pattern);
    }
    /**
   * Task shoot at coordinates.
   *
   * @param position The position to shoot at.
   * @param duration The duration in milliseconds.
   * @param pattern The pattern.
   */
    public ShootAtCoord(position: Vector3, duration: number = -1, pattern: FiringPattern = FiringPattern.Default) {
        TaskShootAtCoord(this._ped.Handle, position.x, position.y, position.z, duration, pattern);
    }
    /**
   * Task shoot at coordinates.
   * Makes the specified ped shuffle to the next vehicle seat.
   *
   * @param vehicle The target vehicle.
   */
    public ShuffleToNextVehicleSeat(vehicle: Vehicle) {
        TaskShuffleToNextVehicleSeat(this._ped.Handle, vehicle.Handle);
    }
    /**
   * Task skydive.
   */
    public Skydive() {
        TaskSkyDive(this._ped.Handle);
    }
    /**
   * Task shoot at coordinates.
   *
   * @param position The position to slide to.
   * @param heading The position to slide to.
   * @param duration The position to slide to.
   */
    public SlideTo(position: Vector3, heading: number, duration: number = 0.7) {
        TaskPedSlideToCoord(this._ped.Handle, position.x, position.y, position.z, heading, duration);
    }
    /**
   * Task stand still.
   *
   * @param duration The duration in milliseconds.
   */
    public StandStill(duration: number) {
        TaskStandStill(this._ped.Handle, duration);
    }
    /**
   * Task play a scenario.
   *
   * @param name The animation name.
   * @param position The position to stand at.
   */
    public StartScenario(name: string, position: Vector3) {
        TaskStartScenarioAtPosition(this._ped.Handle, name, position.x, position.y, position.z, 0.0, 0, false, true);
    }
    /**
   * Task swap weapon.
   */
    public SwapWeapon() {
        TaskSwapWeapon(this._ped.Handle, false);
    }
    /**
   * Task turn to face entity.
   *
   * @param entity The entity to turn towards.
   * @param duration The amount of time in milliseconds to do the task.
   * -1 will keep the task going until either another task is applied.
   */
    public TurnToEntity(entity: Entity, duration: number = -1) {
        TaskTurnPedToFaceEntity(this._ped.Handle, entity.Handle, duration);
    }
    /**
   * Task turn to face coordinate.
   *
   * @param entity The coordinate to turn towards.
   * @param duration The amount of time in milliseconds to do the task.
   * -1 will keep the task going until either another task is applied.
   */
    public TurnToCoord(position: Vector3, duration: number = -1) {
        TaskTurnPedToFaceCoord(this._ped.Handle, position.x, position.y, position.z, duration);
    }
    /**
   * Task use parachute.
   */
    public UseParachute() {
        TaskParachute(this._ped.Handle, true);
    }
    /**
   * Task turn to face coordinate.
   *
   * @param duration The amount of time in milliseconds to do the task.
   * -1 will keep the task going until either another task is applied.
   */
    public UseMobilePhone(duration?: number) {
        if (duration != null && duration !== -1)
            TaskUseMobilePhoneTimed(this._ped.Handle, duration);
        else
            TaskUseMobilePhone(this._ped.Handle, 1);
    }
    /**
   * Task put parachute away.
   *
   */
    public PutAwayParachute() {
        TaskParachute(this._ped.Handle, false);
    }
    /**
   * Task put mobile phone away.
   *
   */
    public PutAwayMobilePhone() {
        TaskUseMobilePhone(this._ped.Handle, 0);
    }
    /**
   * Task chase vehicle.
   *
   * @param target The target ped.
   */
    public VehicleChase(target: Ped) {
        TaskVehicleChase(this._ped.Handle, target.Handle);
    }
    /**
   * Task vehicle shoot at ped.
   *
   * @param target The target ped.
   */
    public VehicleShootAtPed(target: Ped) {
        TaskVehicleShootAtPed(this._ped.Handle, target.Handle, 0);
    }

    /**
   * Task wait 
   *
   * @param duration The amount of time in milliseconds to wait.
   */
    public Wait(duration: number) {
        TaskPause(this._ped.Handle, duration);
    }
    /**
   * Task wander around. 
    */
    public WanderAround() {
        TaskWanderStandard(this._ped.Handle, 10.0, 10.0);
    }

     /**
   * Task wander around inside a radius of a position
   * 
   * @param position The position to wander around
   * @param radius The radius to wander around
   */
      public WanderAroundInArea(position: Vector3, radius: number) {
        TaskWanderInArea(this._ped.Handle, position.x, position.y, position.z, radius, 10.0, 10.0);
    }
    /**
   * Task Warps the ped in to vehicle
   * 
   * @param vehicle The vehicle to warp in to
   */
    public WarpIntoVehicle(vehicle: Vehicle, seat: number) {
        TaskWarpPedIntoVehicle(this._ped.Handle, vehicle.Handle, seat);
    }
    /**
   * Task Warps the ped out of vehicle
   * 
   * @param vehicle The vehicle to warp out of
   */
    public WarpOutOfVehicle(vehicle: Vehicle) {
        TaskLeaveVehicle(this._ped.Handle, vehicle.Handle, LeaveVehicleFlags.WarpOut);
    }
    /**
   * Task clear all tasks
   */
    public ClearAll() {
        ClearPedTasks(this._ped.Handle);
    }
    /**
   * Task clear all immediate tasks
   */
    public ClearAllImmediately() {
        ClearPedTasksImmediately(this._ped.Handle);
    }
    /**
   * Task clear look at
   */
    public ClearLookAt() {
        TaskClearLookAt(this._ped.Handle);
    }
    /**
   * Task clear secondary task
   */
    public ClearSecondary() {
        ClearPedSecondaryTask(this._ped.Handle);
    }
  /**
   * Task stop a animation task
   *
   * @param animDict The animation dictionary
   * @param animName The animation name
   */
    public ClearAnimation(animDict: string, animName: string) {
        StopAnimTask(this._ped.Handle, animDict, animName, -4.0);
    }
}