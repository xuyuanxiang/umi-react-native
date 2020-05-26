#import "Multibundle.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>

@implementation Multibundle

RCT_EXPORT_MODULE(Multibundle)

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(loadBundle:(NSString *)bundleName
    bundleId:(nonnull NSNumber *)bundleId
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTBridge *bridge = _bridge;

    @try
    {
        [bridge registerSegmentWithId:[bundleId unsignedIntegerValue] path:[[NSBundle mainBundle] pathForResource:bundleName ofType:@"ios.bundle"]];

        resolve(nil);

    } @catch (NSException * exception)
    {
        reject(@"error", @"error", nil);
    }
}

@end
