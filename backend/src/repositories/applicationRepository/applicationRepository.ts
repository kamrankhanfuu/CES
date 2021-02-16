import { Constructable, MetadataObj } from "@commons";
import { Pagination } from "@paginate";
import { Request } from "express";
import { AbstractRepository, DeleteResult, ObjectID } from "typeorm";

export interface ApplicationRepository<T> extends AbstractRepository<T> {
    EntityType: Constructable<T>;

    findById(id: string | ObjectID): Promise<T>;

    findByIds(ids: string[] | ObjectID[]): Promise<T[]>;

    findAll(request: Request, appQuery: any): Promise<Pagination<T>>;

    findAllNoPaginate(appQuery: any): Promise<T[]>;

    customCreate(args: MetadataObj, permitKeys?: Array<string>): Promise<T>;

    customUpdate(entity: T, args: MetadataObj, permitKeys?: Array<string>): Promise<T>;

    findAndUpdate(id: string, args: MetadataObj, permitKeys?: Array<string>): Promise<T>;

    destroy(id: string): Promise<DeleteResult>;
}
