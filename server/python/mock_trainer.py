
import sys
import time
import json
import random
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-id', required=True)
    parser.add_argument('--config', required=True) # JSON string
    args = parser.parse_args()

    try:
        config = json.loads(args.config)
        epochs = int(config.get('epochs', 5))
        steps_per_epoch = 10
        total_steps = epochs * steps_per_epoch
        
        print(json.dumps({"type": "log", "msg": f"[System] Initializing Python Trainer for Job {args.job_id}..."}))
        sys.stdout.flush()
        time.sleep(1)

        print(json.dumps({"type": "status", "status": "RUNNING", "msg": f"Starting Training: {epochs} Epochs"}))
        sys.stdout.flush()

        loss = 2.5
        
        for step in range(1, total_steps + 1):
            time.sleep(1.0) # Simulate computation
            
            # Decay loss
            loss = max(0.01, loss * 0.95 + (random.random() * 0.1 - 0.05))
            
            # Log metric
            metric = {
                "type": "metric",
                "step": step,
                "epoch": (step-1) // steps_per_epoch + 1,
                "loss": round(loss, 4),
                "lr": config.get('learningRate', '2e-4')
            }
            print(json.dumps(metric))
            sys.stdout.flush()

        print(json.dumps({"type": "status", "status": "COMPLETED", "msg": "Training Finished Successfully."}))
        sys.stdout.flush()
        
    except Exception as e:
        print(json.dumps({"type": "status", "status": "FAILED", "msg": str(e)}))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
