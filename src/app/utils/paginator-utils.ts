/**
 * Compute paginator page size options as multiples of `step`.
 * Returns an array like [step, 2*step, ..., N*step] where N*step >= total
 * and at least up to `minMax` (to provide reasonable choices for small datasets).
 */
export function computePageSizeOptions(total: number): number[] {
    const totalData = total || 0;       // IMPORTANT: total must come from aa
    const step = 25;
    // compute nearest multiple of step
    const maxNeeded = Math.ceil(totalData / step) * step;
    const options: number[] = [];
    for (let v = step; v <= maxNeeded; v += step) {
      options.push(v);
    }
    return options;
}
