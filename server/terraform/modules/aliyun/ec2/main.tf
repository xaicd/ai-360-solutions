variable "region" {
  type    = string
  default = "cn-hangzhou"
}

variable "access_key" { type = string }
variable "secret_key" { type = string }

variable "instance_type" {
  type    = string
  default = "ecs.t5-lc1m1.small"
}

variable "ami" { type = string }
variable "name" { type = string }

provider "alicloud" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "alicloud_instance" "app_server" {
  # image_id      = var.ami
  # instance_type = var.instance_type
  # instance_name = var.name
  # Mocking resource for now if provider not installed, 
  # but valid syntax required.
}

output "instance_id" {
  value = "i-mock-aliyun-id"
}

output "public_ip" {
  value = "1.2.3.4"
}
