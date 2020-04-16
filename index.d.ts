export = Replica
export as namespace Replica

declare namespace Replica {
    abstract class Replicant {
        
    }

    function Register(key: string | number | Instance, replicant: Replica.Replicant): void
}