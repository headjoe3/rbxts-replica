import '@rbxts/types'

export = Replica
export as namespace Replica

declare class Signal<CallbackType extends (...args: any[]) => void> {
    Connect(callback: CallbackType): RBXScriptConnection
    Fire(...args: FunctionArguments<CallbackType>): void
    Wait(): FunctionArguments<CallbackType>
    Destroy(): void
}

type ReplicantIndexKey = string | number
type ReplicaRegistryKey = string | number | Instance
type ReplicaSerializedValue = [ReplicantIndexKey | undefined, string, unknown]
type ReplicaConfig = {
    ServerCanSet: boolean
    ClientCanSet: boolean
    SubscribeAll: boolean
    Whitelist: Array<Player>
    Blacklist: Array<Player>
}
type ReplicantContext = {
    base: Replica.Replicant<{[index: string]: unknown}>
    keyPath: Array<string>
    config: ReplicaConfig
    active: boolean
    registryKey: ReplicaRegistryKey
}

type _Array<T> = Array<T>

declare namespace Replica {
    abstract class Replicant<T extends {[index: string]: any}>{
        constructor()
        constructor(partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static FromSerialized(serialized: ReplicaSerializedValue, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext): unknown
        /** Note: this is meant to be called by lua code, and does not interface well with TypeScript classes.
         * Consider using roblox-ts typings for lua code when extending the Replicant base class. */
        static extend<StaticType, MembersType>(): [StaticType, MembersType]
        static SerialType: string
        GetConfig(): ReplicaConfig
        SetConfig(newConfig: ReplicaConfig): void
        Get<K extends keyof T>(key: K): T[K]
        Set<K extends keyof T>(key: K, value: T[K]): void
        Predict<K extends keyof T>(key: K, value: T[K]): void
        Serialize(atKey?: keyof T, forClient?: Player): ReplicaSerializedValue
        Collate(cb: () => void): void
        Local(cb: () => void): void
        GetValueWillUpdateSignal(key: keyof T): Signal<(isLocal: boolean) => void>
        GetValueOnUpdateSignal(key: keyof T): Signal<(isLocal: boolean) => void>
        VisibleToClient(client: Player): boolean
        VisibleToAllClients(): boolean
        CanReplicate(): boolean
        Inspect(maxDepth?: number): void
        MergeSerialized(serialized: ReplicaSerializedValue): void
        Destroy(): void

        public WillUpdate: Signal<(isLocal: boolean) => void>
        public OnUpdate: Signal<(isLocal: boolean) => void>
    }

    class Array<T extends {[index: number]: any}> extends Replicant<T> {
        constructor(initialValues?: _Array<T[keyof T]>)
        constructor(initialValues?: _Array<T[keyof T]>, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static SerialType: 'ArrayReplicant'
        IndexOf(value: T[keyof T]): number
        Ipairs(): [<K extends keyof T>(tab: object, idx: number) => [K, T[K]], T, 0]
        Size(): number
        Insert(value: T[keyof T]): void
        Insert(index: number, value: T[keyof T]): void
        Insert(indexOrValue: number | T[keyof T], value?: T[keyof T]): void
        Remove(index: number): void
        Push(value: T[keyof T]): void
        Pop(): void
    }

    class Map<T extends {[index: string]: any}> extends Replicant<T> {
        constructor(initialValues?: Record<keyof T, T[keyof T]>)
        constructor(initialValues?: Record<keyof T, T[keyof T]>, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static SerialType: 'MapReplicant'
        Pairs(): [<K extends keyof T>(tab: object, idx: number) => [K, T[K]], T]
    }

    class FactoredOr<T extends {[index: string]: true}> extends Replicant<T> {
        constructor(initialValues?: Record<keyof T, boolean>)
        constructor(initialValues?: Record<keyof T, boolean>, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static SerialType: 'FactoredOrReplicant'
        Pairs(): [<K extends keyof T>(tab: object, idx: number) => [K, T[K]], T]
        ResolveState(): boolean
        Set<K extends keyof T>(key: K, value: boolean): void
        Reset(): void
        Toggle<K extends keyof T>(key: K): void
        public StateChanged: Signal<(newState: boolean) => void>
    }

    class FactoredNor<T extends {[index: string]: true}> extends Replicant<T> {
        constructor(initialValues?: Record<keyof T, boolean>)
        constructor(initialValues?: Record<keyof T, boolean>, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static SerialType: 'FactoredNorReplicant'
        Pairs(): [<K extends keyof T>(tab: object, idx: number) => [K, T[K]], T]
        ResolveState(): boolean
        Set<K extends keyof T>(key: K, value: boolean): void
        Reset(): void
        Toggle<K extends keyof T>(key: K): void
        public StateChanged: Signal<(newState: boolean) => void>
    }

    class FactoredSum<T extends {[index: string]: number}> extends Replicant<T> {
        constructor(initialValues?: Record<keyof T, number>)
        constructor(initialValues?: Record<keyof T, number>, partialConfig?: Partial<ReplicaConfig>, context?: ReplicantContext)
        static SerialType: 'FactoredSumReplicant'
        Pairs(): [<K extends keyof T>(tab: object, idx: number) => [K, T[K]], T]
        ResolveState(): number
        Reset(): void
        public StateChanged: Signal<(newState: boolean) => void>
    }

    function Register(key: ReplicaRegistryKey, replicant: Replica.Replicant<{[index: string]: unknown}>): void

    function Unregister(key: ReplicaRegistryKey): void

    function WaitForRegistered<T extends Replica.Replicant<{[index: string]: any}>>(key: ReplicaRegistryKey): T
    function WaitForRegistered<T extends Replica.Replicant<{[index: string]: any}>>(key: ReplicaRegistryKey, timeout: number): T | undefined
    function WaitForRegistered<T extends Replica.Replicant<{[index: string]: any}>>(key: ReplicaRegistryKey, timeout?: number): T | undefined

    function GetRegistered<T extends Replica.Replicant<{[index: string]: any}>>(key: ReplicaRegistryKey): T | undefined

    const Deserialize: typeof Replicant.FromSerialized
    const ReplicantRegistered: Signal<(replicant: Replicant<{[index: string]: unknown}>, key: ReplicaRegistryKey) => void>
    const ReplicantWillRegister: Signal<(replicant: Replicant<{[index: string]: unknown}>, key: ReplicaRegistryKey) => void>
    const ReplicantUnregistered: Signal<(replicant: Replicant<{[index: string]: unknown}>, key: ReplicaRegistryKey) => void>
}