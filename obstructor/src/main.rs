use image::Rgba;
use image::{GenericImage, GenericImageView, Pixel, PixelWithColorType};
use rand::{Rng, rng};

const BLOCK_SIZE: u32 = 250;
fn main() {
    let path = "../sample_images/NFT.png";
    let output_path = "../sample_images/output.png";
    let img = image::open(path).unwrap();
    let mut img2 = img.clone();
    let (x, y) = img.dimensions();
    let pixel = img2.get_pixel(x - 1, y - 1);
    // to copy pixels from the image
    let pixel2 = Rgba::<u8>([0, 0, 0, 0]);
    // just a normal Black pixel

    println!("{:?}", (x, y));

    let (block_x, block_y) = random_coordinates(&x, &y);
    for i in block_x..block_x + BLOCK_SIZE {
        for j in block_y..BLOCK_SIZE + block_y {
            img2.put_pixel(i, j, pixel2);
        }
    }

    img2.save(output_path).unwrap();
}

fn random_coordinates(x: &u32, y: &u32) -> (u32, u32) {
    let mut rng = rand::rng();
    let x_coordinate = rng.random_range(0..x - &BLOCK_SIZE - 1);
    let y_coordinate = rng.random_range(0..y - &BLOCK_SIZE - 1);
    println!("{}  {}", x_coordinate, y_coordinate);
    (x_coordinate, y_coordinate)
}
