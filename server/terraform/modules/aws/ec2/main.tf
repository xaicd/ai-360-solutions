variable "region" {
  type    = string
  default = "us-east-1"
}

variable "access_key" { type = string }
variable "secret_key" { type = string }

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ami" { type = string }
variable "name" { type = string }

provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "aws_instance" "app_server" {
  ami           = var.ami
  instance_type = var.instance_type

  tags = {
    Name = var.name
    ManagedBy = "AI-360-Solutions"
  }
}

output "instance_id" {
  value = aws_instance.app_server.id
}

output "public_ip" {
  value = aws_instance.app_server.public_ip
}
