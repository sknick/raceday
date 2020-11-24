package process

import (
	"github.com/juju/mutex"
	"log"
	"time"
)

// Can be called to acquire a process lock identified with name. If unable to be acquired (e.g., because the process
// lock is already taken), this is logged and the process exits. Note that names must start with a letter and contain at
// most 40 letters, numbers, or dashes. The returned Releaser object should be set to release by deferring a call to its
// Release() method.
func AcquireProcessLock(name string) mutex.Releaser {
	ret, err := mutex.Acquire(mutex.Spec{
		Name:    name,
		Clock:   &mutexClock{},
		Delay:   time.Millisecond,
		Timeout: time.Second,
	})
	if err != nil {
		log.Fatalf("Unable to acquire process lock (%v). Is another instance of this process already running?", err)
	}

	return ret
}

// Used by the AcquireProcessLock() function. Not really understood, but it seems to work.
type mutexClock struct{}

func (mc *mutexClock) After(d time.Duration) <-chan time.Time {
	return time.After(d)
}

func (mc *mutexClock) Now() time.Time {
	return time.Now()
}
