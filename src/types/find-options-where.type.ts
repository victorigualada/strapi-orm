export type FindOptionsWhereProperty<
  PropertyToBeNarrowed,
  Property = PropertyToBeNarrowed,
> = PropertyToBeNarrowed extends Promise<infer I>
  ? FindOptionsWhereProperty<NonNullable<I>>
  : PropertyToBeNarrowed extends Array<infer I>
    ? FindOptionsWhereProperty<NonNullable<I>>
    : PropertyToBeNarrowed extends Function // eslint-disable-line @typescript-eslint/ban-types
      ? never
      : PropertyToBeNarrowed extends Buffer
        ? Property
        : PropertyToBeNarrowed extends Date
          ? Property
          : PropertyToBeNarrowed extends object
            ? {
                [P in keyof PropertyToBeNarrowed]?: FindOptionsWhereProperty<NonNullable<PropertyToBeNarrowed[P]>>
              }
            : Property

/**
 * Used for find operations.
 */
export type FindOptionsWhere<Entity> = {
  [P in keyof Entity]?: P extends 'toString' ? unknown : FindOptionsWhereProperty<NonNullable<Entity[P]>>
}
