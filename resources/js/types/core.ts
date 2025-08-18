import { UserRoles } from '@/types/enums';
import {
    OrderBase,
    Organization,
    OrganizationWithMemberCount,
    Port,
    Service,
    ServiceCategory,
    ServiceSubCategory,
    User,
    Vessel,
} from '@/types/models';

// Generic type for adding relationships
export type WithRelation<T, K extends string, R> = T & Record<K, R>;

// Specific relationship types
export type UserWithOrganizations = WithRelation<User, 'organizations', Organization[]>;
export type UserWithPivot = User & { pivot: { role: UserRoles } };
export type OrganizationWithUsers = WithRelation<Organization, 'users', UserWithPivot[]>;
export type OrganizationWithUsersAndCount = WithRelation<OrganizationWithMemberCount, 'users', UserWithPivot[]>;
export type ServiceWithOrganization = WithRelation<Service, 'organization', Organization>;
export type ServiceWithPort = WithRelation<Service, 'port', Port>;
export type ServiceWithSubCategory = WithRelation<Service, 'sub_category', ServiceSubCategory>;
export type ServiceWithCategory = WithRelation<Service, 'category', ServiceCategory>;
export type ServiceWithRelations = ServiceWithOrganization & ServiceWithPort & ServiceWithSubCategory & ServiceWithCategory;
export type OrderWithServices<S = Service> = WithRelation<OrderBase, 'services', S[]>;
export type OrderWithVessels<V = Vessel> = WithRelation<OrderBase, 'vessels', V[]>;
export type OrderWithRequestingOrganization = WithRelation<OrderBase, 'requesting_organization', Organization>;
export type OrderWithProvidingOrganization = WithRelation<OrderBase, 'providing_organization', Organization>;
export type VesselWithOrganization = WithRelation<Vessel, 'organization', Organization>;

// Complex compositions
export type ServiceWithFullOrganization = ServiceWithOrganization;
export type VesselWithFullOrganization = VesselWithOrganization;
export type OrderWithFullRelations = OrderWithServices<ServiceWithFullOrganization> &
    OrderWithVessels<VesselWithFullOrganization> &
    OrderWithRequestingOrganization &
    OrderWithProvidingOrganization;
