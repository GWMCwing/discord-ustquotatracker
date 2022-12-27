export class SectionQuota {
    // public _id!: ObjectId; removed because of conflict with mongodb

    public semester!: number;

    public classId: number = -1;

    public courseCode: string = '';

    public section: string = '';

    public quota: number = -1;

    public assertIdEquivalent(sectionQuota: SectionQuota) {
        if (this.classId !== sectionQuota.classId) {
            throw new Error(
                'Attempted to compare sectionQuota from different id.'
            );
        }
    }

    public quotaChanged(sectionQuota: SectionQuota) {
        this.assertIdEquivalent(sectionQuota);
        return this.quota !== sectionQuota.quota;
    }
}
